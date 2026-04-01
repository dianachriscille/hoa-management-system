variable "env" {}
variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }
variable "ecs_sg_id" {}
variable "db_password" { sensitive = true }
variable "instance_class" { default = "db.t3.micro" }
variable "allocated_storage" { default = 20 }

resource "aws_security_group" "rds" {
  name   = "hoa-rds-sg-${var.env}"
  vpc_id = var.vpc_id
  ingress { from_port = 5432; to_port = 5432; protocol = "tcp"; security_groups = [var.ecs_sg_id] }
  egress  { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_db_subnet_group" "main" {
  name       = "hoa-db-subnet-${var.env}"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "main" {
  identifier             = "hoa-db-${var.env}"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  max_allocated_storage  = 100
  db_name                = "hoa_system"
  username               = "hoa_admin"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  storage_encrypted      = true
  backup_retention_period = 7
  skip_final_snapshot    = var.env == "dev"
  tags = { Name = "hoa-db-${var.env}" }
}

output "db_endpoint" { value = aws_db_instance.main.endpoint }
output "db_sg_id"    { value = aws_security_group.rds.id }
