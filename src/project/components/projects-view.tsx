"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import type { EditorCore } from "@/core";
import { MigrationDialog } from "@/project/components/migration-dialog";
import { StoragePersistenceDialog } from "@/services/storage/components/storage-persistence-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEditor } from "@/editor/use-editor";
import { useProjectsStore } from "@/project/store";
import type {
	TProjectMetadata,
	TProjectSortKey,
	TProjectSortOption,
} from "@/project/types";
import { formatTimecode, mediaTimeToSeconds } from "opencut-wasm";
import { formatDate } from "@/utils/date";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	GridViewIcon,
	LeftToRightListDashIcon,
	PlusSignIcon,
	Search01Icon,
	Video01Icon,
	MoreHorizontalIcon,
	Delete02Icon,
	Copy01Icon,
	Edit03Icon,
	ArrowDown02Icon,
	InformationCircleIcon,
	PlayIcon,
	Clock01Icon,
} from "@hugeicons/core-free-icons";
import { OcVideoIcon } from "@/components/icons";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteProjectDialog } from "@/project/components/delete-project-dialog";
import { ProjectInfoDialog } from "@/project/components/project-info-dialog";
import { RenameProjectDialog } from "@/project/components/rename-project-dialog";
import { cn } from "@/utils/ui";
import {
	PluginHeaderButton,
	PluginCenterDialog,
	PluginSettingsDialog,
} from "@/plugins";

const formatProjectDuration = ({
	duration,
}: {
	duration: number | undefined;
}) => {
	if (duration === undefined) {
		return null;
	}

	const durationSeconds = mediaTimeToSeconds({ time: duration });
	const format = durationSeconds >= 3600 ? "HH:MM:SS" : "MM:SS";
	return formatTimecode({ time: duration, format }) ?? "";
};

const VIEW_MODE_OPTIONS = [
	{ mode: "grid" as const, icon: GridViewIcon, label: "网格视图" },
	{ mode: "list" as const, icon: LeftToRightListDashIcon, label: "列表视图" },
];

const SORT_LABELS: Record<TProjectSortKey, string> = {
	updatedAt: "修改的",
	createdAt: "创建的",
	name: "名称",
	duration: "时长",
};

export function ProjectsView() {
	const { searchQuery, sortKey, sortOrder, viewMode } = useProjectsStore();
	const editor = useEditor();
	const router = useRouter();
	const sortOption: TProjectSortOption = `${sortKey}-${sortOrder}`;

	const isLoading = useEditor((e) => e.project.getIsLoading());
	const isInitialized = useEditor((e) => e.project.getIsInitialized());
	const projectsToDisplay = useEditor((e) =>
		e.project.getFilteredAndSortedProjects({ searchQuery, sortOption }),
	);

	const handleCreateProject = async () => {
		try {
			const projectId = await editor.project.createNewProject({
				name: "未命名项目",
			});
			router.push(`/editor/${projectId}`);
		} catch (error) {
			toast.error("创建项目失败", {
				description: error instanceof Error ? error.message : "请重试",
			});
		}
	};

	useEffect(() => {
		if (!editor.project.getIsInitialized()) {
			editor.project.loadAllProjects();
		}
	}, [editor.project]);

	return (
		<div className="bg-background min-h-screen text-foreground selection:bg-primary/20 flex flex-col font-sans">
			<MigrationDialog />
			<StoragePersistenceDialog />
			<PluginCenterDialog />
			<PluginSettingsDialog />

			{/* Top Header Bar */}
			<header className="px-6 py-3.5 flex items-center justify-between border-b border-border/25">
				{/* Left: Breadcrumbs + View Switcher */}
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground select-none">
						<span className="hover:text-foreground transition-colors cursor-pointer">
							家
						</span>
						<span className="text-muted-foreground/60">›</span>
						<span className="text-foreground font-semibold">所有项目</span>
					</div>

					<div className="flex items-center rounded-lg border border-border/40 bg-muted/20 p-0.5 ml-1">
						{VIEW_MODE_OPTIONS.map(({ mode, icon, label }) => {
							const isCurrent = viewMode === mode;
							return (
								<button
									key={mode}
									type="button"
									onClick={() =>
										useProjectsStore.getState().setViewMode({ viewMode: mode })
									}
									className={cn(
										"size-6 flex items-center justify-center rounded-md text-muted-foreground transition-all cursor-pointer",
										isCurrent
											? "bg-background text-foreground shadow-xs border border-border/30"
											: "hover:text-foreground",
									)}
									title={label}
								>
									<HugeiconsIcon icon={icon} className="size-3.5" />
								</button>
							);
						})}
					</div>
				</div>

				{/* Right: Search + Plugin Button + New Project Button */}
				<div className="flex items-center gap-2.5">
					<SearchBar className="w-48 sm:w-56" />
					<PluginHeaderButton />
					<Button
						onClick={handleCreateProject}
						className="h-8 px-3.5 text-xs font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 shadow-xs cursor-pointer"
					>
						新项目
					</Button>
				</div>
			</header>

			{/* Sub-bar Toolbar */}
			<ProjectsSubToolbar
				totalCount={projectsToDisplay.length}
				projectIds={projectsToDisplay.map((p) => p.id)}
			/>

			{/* Main Content Area */}
			<main className="flex-1 px-6 pb-12 flex flex-col">
				{isLoading || !isInitialized ? (
					<ProjectsSkeleton />
				) : projectsToDisplay.length === 0 ? (
					<EmptyState onCreateProject={handleCreateProject} />
				) : (
					<div
						className={
							viewMode === "grid"
								? "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
								: "flex flex-col rounded-xl border border-border/40 bg-card/20 divide-y divide-border/30 overflow-hidden shadow-xs"
						}
					>
						{projectsToDisplay.map((project) => (
							<ProjectItem
								key={project.id}
								project={project}
								allProjectIds={projectsToDisplay.map((p) => p.id)}
							/>
						))}
					</div>
				)}
			</main>
		</div>
	);
}

function ProjectsSubToolbar({
	totalCount,
	projectIds,
}: {
	totalCount: number;
	projectIds: string[];
}) {
	const {
		selectedProjectIds,
		sortKey,
		sortOrder,
		setSortOrder,
		setSelectedProjects,
		clearSelectedProjects,
	} = useProjectsStore();

	const selectedProjectCount = selectedProjectIds.length;
	const isAllSelected =
		projectIds.length > 0 && selectedProjectCount === projectIds.length;

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedProjects({ projectIds });
		} else {
			clearSelectedProjects();
		}
	};

	return (
		<div className="px-6 py-3 flex items-center justify-between">
			<div className="flex items-center gap-4 text-xs text-muted-foreground">
				{/* Select All Checkbox */}
				<label className="flex items-center gap-2 cursor-pointer select-none hover:text-foreground transition-colors">
					<Checkbox
						checked={isAllSelected}
						onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
						className="size-4 rounded border-border/60"
					/>
					<span className="text-xs">全选</span>
				</label>

				{/* Sort Dropdown */}
				<SortDropdown>
					<button
						type="button"
						suppressHydrationWarning
						className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer select-none"
					>
						<span>{SORT_LABELS[sortKey]}</span>
						<HugeiconsIcon
							icon={ArrowDown02Icon}
							className={cn(
								"size-3.5 transition-transform",
								sortOrder === "asc" && "rotate-180",
							)}
						/>
					</button>
				</SortDropdown>
			</div>

			{/* Batch Action Floating Overlay Bar */}
			{selectedProjectCount > 0 && <ProjectActions />}
		</div>
	);
}

function SearchBar({
	className,
}: {
	className?: string;
}) {
	const { searchQuery, setSearchQuery } = useProjectsStore();

	return (
		<div className={cn("relative", className)}>
			<HugeiconsIcon
				icon={Search01Icon}
				className="text-muted-foreground/60 pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2"
				aria-hidden="true"
			/>
			<Input
				placeholder="搜索..."
				value={searchQuery}
				onChange={(event) => setSearchQuery({ query: event.target.value })}
				size="sm"
				className="pl-8 pr-3 bg-muted/20 border-border/40 text-xs h-8 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40 placeholder:text-muted-foreground/50"
			/>
		</div>
	);
}

function EmptyState({
	onCreateProject,
}: {
	onCreateProject: () => void;
}) {
	return (
		<div className="flex-1 flex flex-col items-center justify-center text-center gap-3 my-auto py-24 select-none">
			{/* Rounded Dark Video Camera Icon Circle */}
			<div className="size-16 rounded-full bg-muted/30 border border-border/40 flex items-center justify-center text-muted-foreground mb-1 shadow-xs">
				<HugeiconsIcon icon={Video01Icon} className="size-7 text-muted-foreground/70" />
			</div>

			<h2 className="text-base font-semibold text-foreground tracking-tight">
				No projects yet
			</h2>

			<p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
				Start creating your first project. Import media, edit, and export your videos. All privately.
			</p>

			<Button
				onClick={onCreateProject}
				className="mt-3 h-8 px-4 text-xs font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 shadow-sm gap-1.5 cursor-pointer"
			>
				<HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
				<span>Create your first project</span>
			</Button>
		</div>
	);
}

function ProjectActions() {
	const editor = useEditor();
	const { selectedProjectIds, clearSelectedProjects } = useProjectsStore();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const savedProjects = editor.project.getSavedProjects();
	const selectedProjectNames = savedProjects
		.filter((project) => selectedProjectIds.includes(project.id))
		.map((project) => project.name);

	const handleDuplicateSelected = async () => {
		await duplicateProjects({ editor, ids: selectedProjectIds });
		clearSelectedProjects();
	};

	const handleDeleteConfirm = async () => {
		await deleteProjects({ editor, ids: selectedProjectIds });
		clearSelectedProjects();
		setIsDeleteDialogOpen(false);
	};

	return (
		<>
			<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-background/95 border border-border/60 px-5 py-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
				<span className="text-xs font-medium text-foreground">
					已选择 <strong className="text-primary font-bold">{selectedProjectIds.length}</strong> 个项目
				</span>
				<div className="h-4 w-px bg-border/60" />
				<Button
					size="sm"
					variant="outline"
					className="h-7 text-xs gap-1.5 rounded-full"
					onClick={handleDuplicateSelected}
				>
					<HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
					创建副本
				</Button>
				<Button
					size="sm"
					variant="destructive"
					className="h-7 text-xs gap-1.5 rounded-full"
					onClick={() => setIsDeleteDialogOpen(true)}
				>
					<HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
					批量删除
				</Button>
				<Button
					size="sm"
					variant="ghost"
					className="h-7 text-xs rounded-full"
					onClick={clearSelectedProjects}
				>
					取消
				</Button>
			</div>

			<DeleteProjectDialog
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				projectNames={selectedProjectNames}
				onConfirm={handleDeleteConfirm}
			/>
		</>
	);
}

async function deleteProjects({
	editor,
	ids,
}: {
	editor: EditorCore;
	ids: string[];
}) {
	await editor.project.deleteProjects({ ids });
}

async function duplicateProjects({
	editor,
	ids,
}: {
	editor: EditorCore;
	ids: string[];
}) {
	await editor.project.duplicateProjects({ ids });
}

async function renameProject({
	editor,
	id,
	name,
}: {
	editor: EditorCore;
	id: string;
	name: string;
}) {
	await editor.project.renameProject({ id, name });
}

function SortDropdown({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	const { sortKey, setSortKey, sortOrder, setSortOrder } = useProjectsStore();

	if (!mounted) {
		return <>{children}</>;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent className="w-36 rounded-xl" align="start">
				<DropdownMenuCheckboxItem
					checked={sortKey === "updatedAt"}
					onCheckedChange={() => {
						if (sortKey === "updatedAt") {
							setSortOrder({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
						} else {
							setSortKey({ sortKey: "updatedAt" });
						}
					}}
				>
					修改时间
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={sortKey === "createdAt"}
					onCheckedChange={() => {
						if (sortKey === "createdAt") {
							setSortOrder({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
						} else {
							setSortKey({ sortKey: "createdAt" });
						}
					}}
				>
					创建时间
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={sortKey === "name"}
					onCheckedChange={() => {
						if (sortKey === "name") {
							setSortOrder({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
						} else {
							setSortKey({ sortKey: "name" });
						}
					}}
				>
					项目名称
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={sortKey === "duration"}
					onCheckedChange={() => {
						if (sortKey === "duration") {
							setSortOrder({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
						} else {
							setSortKey({ sortKey: "duration" });
						}
					}}
				>
					视频时长
				</DropdownMenuCheckboxItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ProjectItem({
	project,
	allProjectIds,
}: {
	project: TProjectMetadata;
	allProjectIds: string[];
}) {
	const {
		selectedProjectIds,
		viewMode,
		setProjectSelected,
		selectProjectRange,
	} = useProjectsStore();
	const selectedProjectIdSet = new Set(selectedProjectIds);
	const isSelected = selectedProjectIdSet.has(project.id);
	const selectedProjectCount = selectedProjectIds.length;
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
	const editor = useEditor();
	const durationLabel = formatProjectDuration({ duration: project.duration });
	const isGridView = viewMode === "grid";

	const handleRename = () => setIsRenameDialogOpen(true);
	const handleDuplicate = async () => {
		await duplicateProjects({ editor, ids: [project.id] });
	};
	const handleDeleteClick = () => setIsDeleteDialogOpen(true);
	const handleInfoClick = () => setIsInfoDialogOpen(true);
	const handleDeleteConfirm = async () => {
		await deleteProjects({ editor, ids: [project.id] });
		setIsDeleteDialogOpen(false);
	};

	const handleCheckboxChange = ({
		checked,
		shiftKey,
	}: {
		checked: boolean;
		shiftKey: boolean;
	}) => {
		if (shiftKey && checked) {
			selectProjectRange({ projectId: project.id, allProjectIds });
			return;
		}
		setProjectSelected({ projectId: project.id, isSelected: checked });
	};

	const gridContent = (
		<div
			className={cn(
				"group relative flex flex-col overflow-hidden rounded-xl border bg-card/40 hover:bg-card/80 transition-all duration-200 hover:shadow-md",
				isSelected
					? "border-primary ring-1 ring-primary bg-primary/5"
					: "border-border/40 hover:border-border/80",
			)}
		>
			{/* 16:9 Thumbnail Box */}
			<div className="relative aspect-video w-full overflow-hidden bg-muted/30">
				{project.thumbnail ? (
					<Image
						src={project.thumbnail}
						alt={project.name}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex size-full items-center justify-center bg-linear-to-br from-muted/10 via-muted/30 to-muted/60">
						<OcVideoIcon className="text-muted-foreground/30 size-10 shrink-0 group-hover:scale-110 transition-transform duration-200" />
					</div>
				)}

				{/* Checkbox (Top Left) */}
				<div
					className={cn(
						"absolute top-2 left-2 z-20 transition-opacity duration-200",
						isSelected || isDropdownOpen
							? "opacity-100"
							: "opacity-0 group-hover:opacity-100",
					)}
					onClick={(e) => e.stopPropagation()}
				>
					<Checkbox
						checked={isSelected}
						onCheckedChange={(checked) =>
							handleCheckboxChange({
								checked: Boolean(checked),
								shiftKey: false,
							})
						}
						className="size-4 rounded bg-background/90 border-border/80"
					/>
				</div>

				{/* Duration Pill (Bottom Right) */}
				{durationLabel && (
					<div className="absolute bottom-2 right-2 z-10 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono font-medium text-white/90">
						{durationLabel}
					</div>
				)}
			</div>

			{/* Project Info Footer */}
			<div className="flex items-center justify-between p-3 gap-2">
				<div className="flex flex-col min-w-0 flex-1">
					<h3 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
						{project.name}
					</h3>
					<span className="text-[10px] text-muted-foreground mt-0.5">
						{formatDate({ date: project.updatedAt })}
					</span>
				</div>

				<div onClick={(e) => e.stopPropagation()}>
					<ProjectMenu
						isDropdownOpen={isDropdownOpen}
						setIsDropdownOpen={setIsDropdownOpen}
						onRename={handleRename}
						onDuplicate={handleDuplicate}
						onDelete={handleDeleteClick}
						onInfo={handleInfoClick}
					/>
				</div>
			</div>
		</div>
	);

	const listContent = (
		<div
			className={cn(
				"group relative flex items-center justify-between p-2.5 px-4 gap-4 transition-all duration-150 hover:bg-accent/20",
				isSelected && "bg-primary/5",
			)}
		>
			<div className="flex items-center gap-3 min-w-0 flex-1">
				<Checkbox
					checked={isSelected}
					onCheckedChange={(checked) =>
						handleCheckboxChange({
							checked: Boolean(checked),
							shiftKey: false,
						})
					}
					className="size-4 rounded"
				/>

				{/* 16:9 Thumbnail Mini */}
				<div className="relative aspect-video w-16 rounded-md overflow-hidden bg-muted/40 shrink-0">
					{project.thumbnail ? (
						<Image
							src={project.thumbnail}
							alt={project.name}
							fill
							className="object-cover"
						/>
					) : (
						<div className="flex size-full items-center justify-center">
							<OcVideoIcon className="text-muted-foreground/40 size-4" />
						</div>
					)}
				</div>

				<div className="flex flex-col min-w-0 flex-1">
					<h3 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
						{project.name}
					</h3>
					<span className="text-[10px] text-muted-foreground">
						修改于 {formatDate({ date: project.updatedAt })}
					</span>
				</div>
			</div>

			<div className="flex items-center gap-4 shrink-0">
				{durationLabel && (
					<span className="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
						{durationLabel}
					</span>
				)}

				<div onClick={(e) => e.stopPropagation()}>
					<ProjectMenu
						isDropdownOpen={isDropdownOpen}
						setIsDropdownOpen={setIsDropdownOpen}
						onRename={handleRename}
						onDuplicate={handleDuplicate}
						onDelete={handleDeleteClick}
						onInfo={handleInfoClick}
					/>
				</div>
			</div>
		</div>
	);

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<Link
						href={`/editor/${project.id}`}
						className="block focus-visible:outline-none"
					>
						{isGridView ? gridContent : listContent}
					</Link>
				</ContextMenuTrigger>

				<ContextMenuContent className="w-44 rounded-xl">
					<ContextMenuItem asChild>
						<Link href={`/editor/${project.id}`} className="gap-2 text-xs">
							<HugeiconsIcon icon={PlayIcon} className="size-3.5" />
							打开项目
						</Link>
					</ContextMenuItem>
					<ContextMenuItem onClick={handleDuplicate} className="gap-2 text-xs">
						<HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
						创建副本
					</ContextMenuItem>
					<ContextMenuItem onClick={handleRename} className="gap-2 text-xs">
						<HugeiconsIcon icon={Edit03Icon} className="size-3.5" />
						重命名
					</ContextMenuItem>
					<ContextMenuItem onClick={handleInfoClick} className="gap-2 text-xs">
						<HugeiconsIcon icon={InformationCircleIcon} className="size-3.5" />
						项目信息
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem
						onClick={handleDeleteClick}
						className="gap-2 text-xs text-destructive focus:text-destructive"
					>
						<HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
						删除项目
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<RenameProjectDialog
				isOpen={isRenameDialogOpen}
				onOpenChange={setIsRenameDialogOpen}
				projectName={project.name}
				onConfirm={async (name) => {
					await renameProject({ editor, id: project.id, name });
				}}
			/>

			<DeleteProjectDialog
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				projectNames={[project.name]}
				onConfirm={handleDeleteConfirm}
			/>

			<ProjectInfoDialog
				isOpen={isInfoDialogOpen}
				onOpenChange={setIsInfoDialogOpen}
				project={project}
			/>
		</>
	);
}

function ProjectMenu({
	isDropdownOpen,
	setIsDropdownOpen,
	onRename,
	onDuplicate,
	onDelete,
	onInfo,
}: {
	isDropdownOpen: boolean;
	setIsDropdownOpen: (open: boolean) => void;
	onRename: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
	onInfo: () => void;
}) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="size-7 text-muted-foreground hover:text-foreground rounded-md"
			>
				<HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
			</Button>
		);
	}

	return (
		<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="size-7 text-muted-foreground hover:text-foreground rounded-md"
				>
					<HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40 rounded-xl">
				<DropdownMenuItem onClick={onDuplicate} className="gap-2 text-xs">
					<HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
					创建副本
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onRename} className="gap-2 text-xs">
					<HugeiconsIcon icon={Edit03Icon} className="size-3.5" />
					重命名
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onInfo} className="gap-2 text-xs">
					<HugeiconsIcon icon={InformationCircleIcon} className="size-3.5" />
					项目详情
				</DropdownMenuItem>
				<ContextMenuSeparator />
				<DropdownMenuItem
					onClick={onDelete}
					className="gap-2 text-xs text-destructive focus:text-destructive"
				>
					<HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
					删除项目
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ProjectsSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					key={i}
					className="flex flex-col rounded-xl border border-border/30 overflow-hidden p-0 gap-2"
				>
					<Skeleton className="aspect-video w-full" />
					<div className="p-3 pt-0 space-y-1.5">
						<Skeleton className="h-3.5 w-3/4 rounded" />
						<Skeleton className="h-2.5 w-1/2 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}
