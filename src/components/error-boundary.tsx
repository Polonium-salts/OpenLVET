"use client";

import React, { Component, type ReactNode } from "react";
import { logger } from "@/logger";
import { globalLogBuffer } from "@/logger";
import { getActiveTraceId } from "@/logger/tracing";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	module?: string;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
	traceId: string;
}

export class OpenLVETErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
			traceId: getActiveTraceId(),
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		return {
			hasError: true,
			error,
			traceId: getActiveTraceId(),
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		const moduleName = this.props.module || "UI";
		logger.error(`[${moduleName}] Unhandled React Error: ${error.message}`, {
			error,
			componentStack: errorInfo.componentStack,
			traceId: this.state.traceId,
		});
		this.setState({ errorInfo });
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
			traceId: getActiveTraceId(),
		});
	};

	handleCopyDiagnostics = () => {
		const logs = globalLogBuffer.exportToText();
		const report = `OpenLVET Crash Diagnostic Report\nTrace ID: ${this.state.traceId}\nTime: ${new Date().toISOString()}\nError: ${this.state.error?.message}\nStack: ${this.state.error?.stack}\nComponent Stack: ${this.state.errorInfo?.componentStack}\n\nRecent Logs:\n${logs}`;
		navigator.clipboard?.writeText(report);
		alert("诊断日志已复制到剪贴板！");
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-card/60 backdrop-blur-md border border-destructive/30 rounded-2xl m-4 shadow-lg">
					<div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-2xl mb-3">
						⚠️
					</div>
					<h3 className="text-lg font-bold text-foreground">
						界面组件渲染异常
					</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-md">
						OpenLVET 在运行过程中遇到了未捕获的错误。您可尝试重试，或将追踪日志导出以供排查。
					</p>

					<div className="mt-3 px-3 py-1.5 rounded-md bg-muted/60 text-[11px] font-mono text-muted-foreground border border-border/40">
						Trace ID: <span className="text-foreground font-semibold">{this.state.traceId}</span>
					</div>

					{this.state.error && (
						<div className="mt-3 p-3 rounded-lg bg-black/40 text-red-400 text-xs font-mono max-w-lg overflow-x-auto text-left w-full border border-border/20">
							{this.state.error.message}
						</div>
					)}

					<div className="flex items-center gap-2 mt-5">
						<button
							onClick={this.handleReset}
							className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
						>
							重试此组件
						</button>
						<button
							onClick={this.handleCopyDiagnostics}
							className="px-4 py-1.5 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-border/40"
						>
							复制诊断日志
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
