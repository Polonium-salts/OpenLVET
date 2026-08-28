import Link from "next/link";
import { FaGithub } from "react-icons/fa6";
import Image from "next/image";
import { DEFAULT_LOGO_URL } from "@/site/brand";
import { SOCIAL_LINKS } from "@/site/social";

export function Footer() {
	return (
		<footer className="bg-background border-t">
			<div className="mx-auto max-w-5xl px-8 py-8">
				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					<div className="flex items-center gap-2">
						<Image
							src={DEFAULT_LOGO_URL}
							alt="OpenLVET"
							width={22}
							height={22}
							className="invert dark:invert-0"
						/>
						<span className="font-bold">OpenLVET</span>
						<span className="text-muted-foreground text-sm ml-2">
							极简易用、隐私优先且功能强大的在线智能视频剪辑平台
						</span>
					</div>

					<div className="flex items-center gap-4">
						<Link
							href={SOCIAL_LINKS.github}
							className="text-muted-foreground hover:text-foreground transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FaGithub className="size-5" />
						</Link>
						<span className="text-muted-foreground text-xs">
							© {new Date().getFullYear()} OpenLVET
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
