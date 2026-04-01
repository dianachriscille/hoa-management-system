variable "env" {}
variable "vpc_id" {}
variable "private_subnet_ids" { type = list(string) }
variable "ecr_image_uri" {}
variable "secrets_arns" { type = map(string) }
variable "aws_region" { default = "ap-southeast-1" }

resource "aws_security_group" "ecs" {
  name   = "hoa-ecs-sg-${var.env}"
  vpc_id = var.vpc_id
  ingress { from_port = 3000; to_port = 3000; protocol = "tcp"; cidr_blocks = ["10.0.0.0/16"] }
  egress  { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_ecr_repository" "backend" {
  name                 = "hoa-backend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
}

resource "aws_ecs_cluster" "main" {
  name = "hoa-cluster-${var.env}"
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/hoa-system/${var.env}/backend"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "hoa-backend-${var.env}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.env == "prod" ? "512" : "256"
  memory                   = var.env == "prod" ? "1024" : "512"
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "hoa-backend"
    image     = var.ecr_image_uri
    portMappings = [{ containerPort = 3000 }]
    logConfiguration = {
      logDriver = "awslogs"
      options   = { "awslogs-group" = aws_cloudwatch_log_group.backend.name, "awslogs-region" = var.aws_region, "awslogs-stream-prefix" = "ecs" }
    }
    secrets = [for k, v in var.secrets_arns : { name = k, valueFrom = v }]
    healthCheck = { command = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"], interval = 30, timeout = 5, retries = 3 }
  }])
}

resource "aws_ecs_service" "backend" {
  name            = "hoa-backend-${var.env}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
}

resource "aws_appautoscaling_target" "ecs" {
  count              = var.env == "prod" ? 1 : 0
  max_capacity       = 4
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  count              = var.env == "prod" ? 1 : 0
  name               = "hoa-cpu-scaling-${var.env}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs[0].service_namespace
  target_tracking_scaling_policy_configuration {
    target_value       = 70
    scale_in_cooldown  = 300
    scale_out_cooldown = 120
    predefined_metric_specification { predefined_metric_type = "ECSServiceAverageCPUUtilization" }
  }
}

resource "aws_iam_role" "ecs_execution" {
  name = "hoa-ecs-execution-${var.env}"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  name = "hoa-ecs-task-${var.env}"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}

output "ecs_sg_id"      { value = aws_security_group.ecs.id }
output "ecs_cluster_id" { value = aws_ecs_cluster.main.id }
output "ecr_repo_url"   { value = aws_ecr_repository.backend.repository_url }
