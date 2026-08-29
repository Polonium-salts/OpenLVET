import ReactMarkdown from "react-markdown";
import { cn } from "@/utils/ui";

export function ReactMarkdownWrapper({
	children,
	inline = false,
}: {
	children: string;
	inline?: boolean;
}) {
	return (
		<ReactMarkdown
			components={{
				h1: ({ children }) => (
					<h1 className="text-base font-bold text-foreground border-b border-border/40 pb-1.5 mb-2 mt-3 first:mt-0">
						{children}
					</h1>
				),
				h2: ({ children }) => (
					<h2 className="text-sm font-bold text-foreground border-b border-border/30 pb-1 mb-2 mt-3">
						{children}
					</h2>
				),
				h3: ({ children }) => (
					<h3 className="text-xs font-semibold text-foreground mb-1.5 mt-2.5">
						{children}
					</h3>
				),
				h4: ({ children }) => (
					<h4 className="text-xs font-medium text-foreground mb-1 mt-2">
						{children}
					</h4>
				),
				a: ({ className: linkClassName, children, ...props }) => (
					<a
						className={cn("text-primary hover:underline font-medium", linkClassName)}
						target="_blank"
						rel="noopener noreferrer"
						{...props}
					>
						{children}
					</a>
				),
				strong: ({ children }) => (
					<strong className="text-foreground font-semibold">{children}</strong>
				),
				em: ({ children }) => (
					<em className="text-foreground/90 italic">{children}</em>
				),
				code: ({ className: codeClassName, children, ...props }) => (
					<code
						className={cn(
							"rounded border border-primary/20 bg-primary/10 px-1 py-0.5 font-mono text-[0.88em] text-primary",
							codeClassName,
						)}
						{...props}
					>
						{children}
					</code>
				),
				pre: ({ children }) => (
					<pre className="p-3 my-2 rounded-lg bg-black/50 border border-border/40 font-mono text-[11px] overflow-x-auto text-emerald-400">
						{children}
					</pre>
				),
				blockquote: ({ children }) => (
					<blockquote className="border-l-2 border-primary/60 bg-accent/30 pl-3 py-1.5 my-2 text-[11px] text-muted-foreground italic rounded-r">
						{children}
					</blockquote>
				),
				ul: ({ children }) => (
					<ul className="list-disc list-inside space-y-1 my-1.5 text-muted-foreground text-xs">
						{children}
					</ul>
				),
				ol: ({ children }) => (
					<ol className="list-decimal list-inside space-y-1 my-1.5 text-muted-foreground text-xs">
						{children}
					</ol>
				),
				li: ({ children }) => (
					<li className="leading-relaxed text-muted-foreground text-xs">
						{children}
					</li>
				),
				table: ({ children }) => (
					<div className="overflow-x-auto my-2 rounded-lg border border-border/40">
						<table className="w-full text-xs text-left border-collapse">
							{children}
						</table>
					</div>
				),
				thead: ({ children }) => (
					<thead className="bg-accent/40 border-b border-border/40 text-foreground font-semibold">
						{children}
					</thead>
				),
				tbody: ({ children }) => (
					<tbody className="divide-y divide-border/20">{children}</tbody>
				),
				tr: ({ children }) => (
					<tr className="hover:bg-accent/20 transition-colors">{children}</tr>
				),
				th: ({ children }) => (
					<th className="px-3 py-1.5 font-semibold text-foreground text-[11px]">
						{children}
					</th>
				),
				td: ({ children }) => (
					<td className="px-3 py-1.5 text-muted-foreground text-[11px]">
						{children}
					</td>
				),
				hr: () => <hr className="border-border/40 my-3" />,
				p: ({ className: paragraphClassName, children, ...props }) =>
					inline ? (
						<span className={cn("m-0", paragraphClassName)} {...props}>
							{children}
						</span>
					) : (
						<p className={cn("my-1 leading-relaxed text-muted-foreground", paragraphClassName)} {...props}>
							{children}
						</p>
					),
			}}
		>
			{children}
		</ReactMarkdown>
	);
}
