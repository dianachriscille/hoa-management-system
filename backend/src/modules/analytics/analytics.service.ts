import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Response } from 'express';
import * as PDFDocument from 'pdfkit';
import { MonthlyBudgetEntity } from './entities/analytics.entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(MonthlyBudgetEntity) private budgetRepo: Repository<MonthlyBudgetEntity>,
    private dataSource: DataSource,
  ) {}

  async setBudget(period: string, amount: number, userId: string): Promise<MonthlyBudgetEntity> {
    const existing = await this.budgetRepo.findOne({ where: { period } });
    if (existing) { existing.budgetAmount = amount; return this.budgetRepo.save(existing); }
    return this.budgetRepo.save(this.budgetRepo.create({ period, budgetAmount: amount, createdByUserId: userId }));
  }

  async getFinancialDashboard(period: string): Promise<any> {
    const budget = await this.budgetRepo.findOne({ where: { period } });
    const [invoiceStats] = await this.dataSource.query(`
      SELECT
        COUNT(*) as total_invoices,
        COUNT(*) FILTER (WHERE status = 'Paid') as paid_count,
        COALESCE(SUM(amount), 0) as total_invoiced,
        COALESCE(SUM(amount) FILTER (WHERE status = 'Paid'), 0) as total_collected,
        COALESCE(SUM(amount) FILTER (WHERE status IN ('Unpaid','PartiallyPaid','Overdue')), 0) as total_outstanding
      FROM invoice WHERE billing_period = $1
    `, [period]);

    const overdueAging = await this.dataSource.query(`
      SELECT
        CASE
          WHEN CURRENT_DATE - due_date BETWEEN 1 AND 7 THEN '1-7 days'
          WHEN CURRENT_DATE - due_date BETWEEN 8 AND 14 THEN '8-14 days'
          WHEN CURRENT_DATE - due_date BETWEEN 15 AND 30 THEN '15-30 days'
          ELSE '30+ days'
        END as bucket,
        COUNT(*) as count,
        SUM(amount) as amount
      FROM invoice
      WHERE status IN ('Unpaid','PartiallyPaid','Overdue') AND due_date < CURRENT_DATE AND billing_period = $1
      GROUP BY bucket ORDER BY MIN(CURRENT_DATE - due_date)
    `, [period]);

    const total = parseInt(invoiceStats.total_invoices) || 1;
    const paid = parseInt(invoiceStats.paid_count) || 0;
    return {
      period,
      budgetAmount: budget?.budgetAmount ?? null,
      totalInvoiced: parseFloat(invoiceStats.total_invoiced),
      totalCollected: parseFloat(invoiceStats.total_collected),
      totalOutstanding: parseFloat(invoiceStats.total_outstanding),
      collectionRate: `${((paid / total) * 100).toFixed(1)}%`,
      overdueAging,
    };
  }

  async getMaintenanceDashboard(startDate: string, endDate: string): Promise<any> {
    const [open] = await this.dataSource.query(`SELECT COUNT(*) as count FROM maintenance_request WHERE status IN ('Submitted','Assigned','InProgress')`);
    const [closed] = await this.dataSource.query(`SELECT COUNT(*) as count FROM maintenance_request WHERE status = 'Closed' AND closed_at BETWEEN $1 AND $2`, [startDate, endDate]);
    const [avg] = await this.dataSource.query(`SELECT AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/86400) as avg_days FROM maintenance_request WHERE status = 'Closed' AND closed_at BETWEEN $1 AND $2`, [startDate, endDate]);
    const byCategory = await this.dataSource.query(`SELECT category, COUNT(*) as count FROM maintenance_request WHERE created_at BETWEEN $1 AND $2 GROUP BY category`, [startDate, endDate]);
    return { open: parseInt(open.count), closed: parseInt(closed.count), avgResolutionDays: parseFloat(avg.avg_days || '0').toFixed(1), byCategory };
  }

  async getEngagementDashboard(startDate: string, endDate: string): Promise<any> {
    const [total] = await this.dataSource.query(`SELECT COUNT(*) as count FROM resident_profile`);
    const totalResidents = parseInt(total.count) || 1;
    const [polls] = await this.dataSource.query(`SELECT COUNT(DISTINCT user_id) as count FROM poll_vote WHERE voted_at BETWEEN $1 AND $2`, [startDate, endDate]);
    const [rsvp] = await this.dataSource.query(`SELECT COUNT(*) as count FROM event_rsvp WHERE status = 'Attending' AND responded_at BETWEEN $1 AND $2`, [startDate, endDate]);
    const [reads] = await this.dataSource.query(`SELECT COUNT(DISTINCT user_id) as count FROM announcement_read WHERE read_at BETWEEN $1 AND $2`, [startDate, endDate]);
    return {
      pollParticipationRate: `${((parseInt(polls.count) / totalResidents) * 100).toFixed(1)}%`,
      eventRsvpRate: `${((parseInt(rsvp.count) / totalResidents) * 100).toFixed(1)}%`,
      announcementOpenRate: `${((parseInt(reads.count) / totalResidents) * 100).toFixed(1)}%`,
    };
  }

  async exportReport(type: string, period: string, format: string, res: Response): Promise<void> {
    let data: any;
    const [start, end] = period.includes('/') ? period.split('/') : [`${period}-01`, `${period}-31`];

    if (type === 'financial') data = await this.getFinancialDashboard(period);
    else if (type === 'maintenance') data = await this.getMaintenanceDashboard(start, end);
    else data = await this.getEngagementDashboard(start, end);

    const filename = `hoa-${type}-${period.replace('/', '-')}`;

    if (format === 'csv') {
      const rows = this.buildCsvRows(type, data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(rows);
    } else {
      const doc = new PDFDocument({ margin: 40 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      doc.pipe(res);
      doc.fontSize(18).text(`HOA ${type.charAt(0).toUpperCase() + type.slice(1)} Report`, { align: 'center' });
      doc.fontSize(12).text(`Period: ${period}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(11).text(JSON.stringify(data, null, 2));
      doc.end();
    }
  }

  private buildCsvRows(type: string, data: any): string {
    if (type === 'financial') {
      return `Period,Budget,Total Invoiced,Total Collected,Total Outstanding,Collection Rate\n${data.period},${data.budgetAmount ?? 'Not set'},${data.totalInvoiced},${data.totalCollected},${data.totalOutstanding},${data.collectionRate}`;
    }
    if (type === 'maintenance') {
      const header = 'Open,Closed,Avg Resolution Days\n';
      const row = `${data.open},${data.closed},${data.avgResolutionDays}\n`;
      const catHeader = '\nCategory,Count\n';
      const catRows = data.byCategory.map((r: any) => `${r.category},${r.count}`).join('\n');
      return header + row + catHeader + catRows;
    }
    return `Poll Participation,Event RSVP Rate,Announcement Open Rate\n${data.pollParticipationRate},${data.eventRsvpRate},${data.announcementOpenRate}`;
  }
}
