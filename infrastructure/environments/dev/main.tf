terraform {
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
  backend "s3" {
    bucket         = "hoa-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "hoa-terraform-locks"
    encrypt        = true
  }
}

provider "aws" { region = "ap-southeast-1" }

module "network" {
  source = "../../modules/network"
  env    = "dev"
}

module "database" {
  source            = "../../modules/database"
  env               = "dev"
  vpc_id            = module.network.vpc_id
  subnet_ids        = module.network.private_subnet_ids
  ecs_sg_id         = module.backend.ecs_sg_id
  db_password       = var.db_password
  instance_class    = "db.t3.micro"
  allocated_storage = 20
}

module "backend" {
  source             = "../../modules/backend"
  env                = "dev"
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  ecr_image_uri      = "${module.backend.ecr_repo_url}:dev"
  secrets_arns       = var.secrets_arns
}

variable "db_password"  { sensitive = true }
variable "secrets_arns" { type = map(string) default = {} }
