.PHONY: help deploy build status logs stop clean restart build-web list-builds clean-builds rollback-build generate-ssl check-ssl

# Default target
.DEFAULT_GOAL := help

# Service names
SERVICES := mysql web backend
SERVICE ?=

# Build version (for deploying specific version)
BUILD_VERSION ?= latest

# Number of builds to keep when cleaning
KEEP ?= 10

# Colors for output
COLOR_RESET := \033[0m
COLOR_BOLD := \033[1m
COLOR_GREEN := \033[32m
COLOR_YELLOW := \033[33m
COLOR_BLUE := \033[34m

# Helper function to filter service
define filter_service
	$(if $(SERVICE),$(if $(filter $(SERVICE),$(SERVICES)),$(SERVICE),$(error Invalid SERVICE. Must be one of: $(SERVICES))),)
endef

help: ## 显示帮助信息
	@echo "$(COLOR_BOLD)Spot 项目 Docker 管理命令$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BLUE)使用方法:$(COLOR_RESET)"
	@echo "  make <命令> [参数]"
	@echo ""
	@echo "$(COLOR_BLUE)可用命令:$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_GREEN)%-15s$(COLOR_RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(COLOR_BLUE)可用服务:$(COLOR_RESET)"
	@echo "  $(COLOR_YELLOW)mysql$(COLOR_RESET)    - MySQL 数据库"
	@echo "  $(COLOR_YELLOW)backend$(COLOR_RESET)  - FastAPI 后端服务"
	@echo "  $(COLOR_YELLOW)web$(COLOR_RESET)      - React 管理后台"
	@echo ""
	@echo "$(COLOR_BLUE)基础使用:$(COLOR_RESET)"
	@echo "  make deploy                      # 部署所有服务"
	@echo "  make deploy SERVICE=backend      # 只部署后端服务"
	@echo "  make logs SERVICE=mysql          # 查看 MySQL 日志"
	@echo "  make status                      # 查看所有服务状态"
	@echo ""
	@echo "$(COLOR_BLUE)前端构建与部署:$(COLOR_RESET)"
	@echo "  make build-web                   # 本地构建前端（生成带版本号的归档）"
	@echo "  make deploy SERVICE=web          # 部署最新版本"
	@echo "  BUILD_VERSION=xxx make deploy SERVICE=web  # 部署指定版本"
	@echo ""
	@echo "$(COLOR_BLUE)版本管理:$(COLOR_RESET)"
	@echo "  make list-builds                 # 列出所有构建版本"
	@echo "  make clean-builds KEEP=5         # 清理旧版本（保留最近5个）"
	@echo "  make rollback-build VERSION=xxx  # 回滚到指定版本"

deploy: ## 重建并部署服务 (可选: SERVICE=mysql|web|backend, BUILD_VERSION=版本号)
	@echo "$(COLOR_BOLD)>>> 重建并部署服务...$(COLOR_RESET)"
	@# 如果要部署 web 服务（单独或全部），先准备构建产物
	@if [ "$(SERVICE)" = "web" ] || [ -z "$(SERVICE)" ]; then \
		if [ ! -L "builds/web/latest" ]; then \
			echo "$(COLOR_YELLOW)❌ 错误: 未找到 Web 构建产物$(COLOR_RESET)"; \
			echo "$(COLOR_YELLOW)>>> 请先运行: make build-web$(COLOR_RESET)"; \
			exit 1; \
		fi; \
		ACTUAL_VERSION=$$(readlink builds/web/latest); \
		DEPLOY_VERSION="$(BUILD_VERSION)"; \
		if [ "$$DEPLOY_VERSION" != "latest" ] && [ ! -d "builds/web/$$DEPLOY_VERSION" ]; then \
			echo "$(COLOR_YELLOW)❌ 错误: 版本 $$DEPLOY_VERSION 不存在$(COLOR_RESET)"; \
			echo "$(COLOR_YELLOW)>>> 可用版本列表:$(COLOR_RESET)"; \
			ls -1 builds/web/ | grep -v latest | grep -v '.gitkeep'; \
			exit 1; \
		fi; \
		if [ "$$DEPLOY_VERSION" = "latest" ]; then \
			echo "$(COLOR_BLUE)>>> 准备 Web 服务部署: latest ($$ACTUAL_VERSION)$(COLOR_RESET)"; \
		else \
			echo "$(COLOR_BLUE)>>> 准备 Web 服务部署: $$DEPLOY_VERSION$(COLOR_RESET)"; \
			ACTUAL_VERSION="$$DEPLOY_VERSION"; \
		fi; \
		echo "$(COLOR_YELLOW)>>> 复制构建产物到 Docker 构建上下文...$(COLOR_RESET)"; \
		rm -rf admin-web/dist; \
		mkdir -p admin-web/dist; \
		cp -r builds/web/$$ACTUAL_VERSION/* admin-web/dist/; \
		echo "$(COLOR_GREEN)✓ 已复制版本: $$ACTUAL_VERSION$(COLOR_RESET)"; \
	fi
	@if [ -n "$(call filter_service)" ]; then \
		echo "$(COLOR_YELLOW)>>> 重建服务: $(SERVICE)$(COLOR_RESET)"; \
		docker compose up -d --build $(SERVICE); \
	else \
		echo "$(COLOR_YELLOW)>>> 重建所有服务$(COLOR_RESET)"; \
		docker compose up -d --build; \
	fi
	@echo "$(COLOR_GREEN)>>> 部署完成!$(COLOR_RESET)"
	@$(MAKE) --no-print-directory status

build: ## 构建服务镜像 (可选: SERVICE=mysql|web|backend)
	@echo "$(COLOR_BOLD)>>> 构建服务镜像...$(COLOR_RESET)"
	@if [ -n "$(call filter_service)" ]; then \
		echo "$(COLOR_YELLOW)>>> 构建服务: $(SERVICE)$(COLOR_RESET)"; \
		docker compose build $(SERVICE); \
	else \
		echo "$(COLOR_YELLOW)>>> 构建所有服务$(COLOR_RESET)"; \
		docker compose build; \
	fi
	@echo "$(COLOR_GREEN)>>> 构建完成!$(COLOR_RESET)"

status: ## 查看服务状态
	@echo "$(COLOR_BOLD)>>> 服务状态:$(COLOR_RESET)"
	@docker compose ps

logs: ## 查看服务日志 (可选: SERVICE=mysql|web|backend)
	@if [ -n "$(call filter_service)" ]; then \
		echo "$(COLOR_BOLD)>>> 查看服务日志: $(SERVICE)$(COLOR_RESET)"; \
		docker compose logs -f $(SERVICE); \
	else \
		echo "$(COLOR_BOLD)>>> 查看所有服务日志$(COLOR_RESET)"; \
		docker compose logs -f; \
	fi

stop: ## 停止服务 (可选: SERVICE=mysql|web|backend)
	@echo "$(COLOR_BOLD)>>> 停止服务...$(COLOR_RESET)"
	@if [ -n "$(call filter_service)" ]; then \
		echo "$(COLOR_YELLOW)>>> 停止服务: $(SERVICE)$(COLOR_RESET)"; \
		docker compose stop $(SERVICE); \
	else \
		echo "$(COLOR_YELLOW)>>> 停止所有服务$(COLOR_RESET)"; \
		docker compose stop; \
	fi
	@echo "$(COLOR_GREEN)>>> 服务已停止$(COLOR_RESET)"

restart: ## 重启服务 (可选: SERVICE=mysql|web|backend)
	@echo "$(COLOR_BOLD)>>> 重启服务...$(COLOR_RESET)"
	@if [ -n "$(call filter_service)" ]; then \
		echo "$(COLOR_YELLOW)>>> 重启服务: $(SERVICE)$(COLOR_RESET)"; \
		docker compose restart $(SERVICE); \
	else \
		echo "$(COLOR_YELLOW)>>> 重启所有服务$(COLOR_RESET)"; \
		docker compose restart; \
	fi
	@echo "$(COLOR_GREEN)>>> 重启完成!$(COLOR_RESET)"
	@$(MAKE) --no-print-directory status

clean: ## 停止并清理所有容器、网络和卷
	@echo "$(COLOR_BOLD)$(COLOR_YELLOW)>>> 警告: 这将删除所有容器、网络和数据卷!$(COLOR_RESET)"
	@read -p "确认继续? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(COLOR_BOLD)>>> 清理资源...$(COLOR_RESET)"; \
		docker compose down -v; \
		echo "$(COLOR_GREEN)>>> 清理完成!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)>>> 已取消$(COLOR_RESET)"; \
	fi

build-web: ## 本地构建前端（用于低配置服务器）
	@echo "$(COLOR_BOLD)>>> 本地构建前端...$(COLOR_RESET)"
	@./scripts/build-web.sh

list-builds: ## 列出所有构建版本
	@echo "$(COLOR_BOLD)>>> Web 构建版本列表:$(COLOR_RESET)"
	@echo ""
	@if [ ! -d "builds/web" ] || [ -z "$$(ls -A builds/web/ 2>/dev/null | grep -v '.gitkeep')" ]; then \
		echo "$(COLOR_YELLOW)  暂无构建版本$(COLOR_RESET)"; \
		echo "$(COLOR_YELLOW)  运行 'make build-web' 创建第一个构建$(COLOR_RESET)"; \
	else \
		LATEST=$$(readlink builds/web/latest 2>/dev/null || echo ""); \
		TOTAL_SIZE=0; \
		COUNT=0; \
		ls -lt builds/web/ | grep -v 'total' | grep -v 'latest' | grep -v '.gitkeep' | while read -r line; do \
			dir=$$(echo "$$line" | awk '{print $$NF}'); \
			if [ -d "builds/web/$$dir" ]; then \
				size=$$(du -sh "builds/web/$$dir" | cut -f1); \
				if [ "$$dir" = "$$LATEST" ]; then \
					printf "  $(COLOR_GREEN)%-20s$(COLOR_RESET) $(COLOR_BLUE)(latest)$(COLOR_RESET) ← %s\n" "$$dir" "$$size"; \
				else \
					printf "  $(COLOR_YELLOW)%-20s$(COLOR_RESET) ← %s\n" "$$dir" "$$size"; \
				fi; \
			fi; \
		done; \
		echo ""; \
		TOTAL=$$(du -sh builds/web/ 2>/dev/null | cut -f1); \
		COUNT=$$(ls -1 builds/web/ | grep -v latest | grep -v '.gitkeep' | wc -l | tr -d ' '); \
		echo "$(COLOR_BLUE)  总计: $$COUNT 个版本, 占用 $$TOTAL$(COLOR_RESET)"; \
	fi
	@echo ""

clean-builds: ## 清理旧版本构建 (可选: KEEP=保留数量, 默认10)
	@echo "$(COLOR_BOLD)>>> 清理旧版本构建...$(COLOR_RESET)"
	@if [ ! -d "builds/web" ]; then \
		echo "$(COLOR_YELLOW)  builds/web 目录不存在$(COLOR_RESET)"; \
		exit 0; \
	fi
	@LATEST=$$(readlink builds/web/latest 2>/dev/null || echo ""); \
	COUNT=$$(ls -1t builds/web/ | grep -v latest | grep -v '.gitkeep' | wc -l | tr -d ' '); \
	if [ $$COUNT -le $(KEEP) ]; then \
		echo "$(COLOR_GREEN)  当前有 $$COUNT 个版本，不超过保留数量 $(KEEP)，无需清理$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)  保留最近 $(KEEP) 个版本，删除其他...$(COLOR_RESET)"; \
		echo ""; \
		DELETE_COUNT=$$(($$COUNT - $(KEEP))); \
		DELETED_SIZE=0; \
		ls -1t builds/web/ | grep -v latest | grep -v '.gitkeep' | tail -n $$DELETE_COUNT | while read -r dir; do \
			if [ -d "builds/web/$$dir" ] && [ "$$dir" != "$$LATEST" ]; then \
				SIZE=$$(du -sh "builds/web/$$dir" | cut -f1); \
				echo "$(COLOR_YELLOW)  删除: $$dir ($$SIZE)$(COLOR_RESET)"; \
				rm -rf "builds/web/$$dir"; \
			fi; \
		done; \
		echo ""; \
		echo "$(COLOR_GREEN)✓ 清理完成!$(COLOR_RESET)"; \
	fi

rollback-build: ## 回滚到指定版本 (需要: VERSION=版本号)
	@if [ -z "$(VERSION)" ]; then \
		echo "$(COLOR_YELLOW)❌ 错误: 请指定版本号$(COLOR_RESET)"; \
		echo "$(COLOR_YELLOW)>>> 用法: make rollback-build VERSION=20260201-113045$(COLOR_RESET)"; \
		echo ""; \
		echo "$(COLOR_BLUE)可用版本:$(COLOR_RESET)"; \
		ls -1 builds/web/ | grep -v latest | grep -v '.gitkeep' | head -10; \
		exit 1; \
	fi
	@if [ ! -d "builds/web/$(VERSION)" ]; then \
		echo "$(COLOR_YELLOW)❌ 错误: 版本 $(VERSION) 不存在$(COLOR_RESET)"; \
		echo ""; \
		echo "$(COLOR_BLUE)可用版本:$(COLOR_RESET)"; \
		ls -1 builds/web/ | grep -v latest | grep -v '.gitkeep' | head -10; \
		exit 1; \
	fi
	@echo "$(COLOR_BOLD)>>> 回滚 latest 链接到: $(VERSION)$(COLOR_RESET)"
	@cd builds/web && rm -f latest && ln -s $(VERSION) latest
	@echo "$(COLOR_GREEN)✓ 已更新 latest → $(VERSION)$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BLUE)>>> 使用以下命令部署:$(COLOR_RESET)"
	@echo "    make deploy SERVICE=web"

