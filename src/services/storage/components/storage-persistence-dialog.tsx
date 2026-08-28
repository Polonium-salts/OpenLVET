"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useStoragePersistence } from "@/services/storage/use-storage-persistence";

export function StoragePersistenceDialog() {
	const { showDialog, onConfirm, onDismiss } = useStoragePersistence();

	if (!showDialog) return null;

	return (
		<Dialog open={true} onOpenChange={(open) => !open && onDismiss()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>开启持久化存储保护</DialogTitle>
				</DialogHeader>
				<DialogBody className="space-y-2">
					<p className="text-sm text-muted-foreground">
						当系统磁盘空间紧张时，浏览器可能会自动清理网页的本地缓存数据。
					</p>
					<p className="text-sm text-foreground font-medium">
						建议允许 OpenLVET 申请持久化存储权限，防止您的剪辑草稿与素材被系统意外清理。
					</p>
				</DialogBody>
				<DialogFooter>
					<Button variant="outline" onClick={onDismiss}>
						暂不开启
					</Button>
					<Button onClick={onConfirm}>允许保护</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
