"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { EditorCore } from "@/core";
import { MigrationDialog } from "@/project/components/migration-dialog";
import { StoragePersistenceDialog } from "@/services/storage/components/storage-persistence-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
	Calendar04Icon,
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
	ClosedCaptionIcon,
	Film01Icon,
	HeadphonesIcon,
	SlidersHorizontalIcon,
	ScissorIcon,
	PlayIcon,
	Clock01Icon,
	SparklesIcon,
} from "@hugeicons/core-free-icons";
import { OcVideoIcon } from "@/components/icons";
import { Label } from "@/components/ui/label";
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
import { ChangelogNotification } from "@/changelog/components/changelog-notification";
import { ThemeToggle } from "@/components/theme-toggle";
import { DEFAULT_LOGO_URL } from "@/site/brand";

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

export function ProjectsView() {
	const { searchQuery, sortKey, sortOrder, viewMode } = useProjectsStore();
	const editor = useEditor();
	const sortOption: TProjectSortOption = `${sortKey}-${sortOrder}`;

	const isLoading = useEditor((e) => e.project.getIsLoading());
	const isInitialized = useEditor((e) => e.project.getIsInitialized());
	const projectsToDisplay = useEditor((e) =>
		e.project.getFilteredAndSortedProjects({ searchQuery, sortOption }),
	);

	useEffect(() => {
		if (!editor.project.getIsInitialized()) {
			editor.project.loadAllProjects();
		}
	}, [editor.project]);

	return (
		<div className="bg-background min-h-screen text-foreground selection:bg-primary/20">
			<MigrationDialog />
			<StoragePersistenceDialog />
			<ChangelogNotification />
			
			{/* JianYing Top Header */}
			<ProjectsHeader />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 flex flex-col gap-8">
				{/* JianYing Hero Start Creation & Quick Tools */}
				<HeroCreationSection />

				{/* JianYing Projects / Drafts Workspace */}
				<div className="flex flex-col gap-4">
					<ProjectsToolbar
						totalCount={projectsToDisplay.length}
						projectIds={projectsToDisplay.map((p) => p.id)}
					/>

					<main className="flex flex-col gap-4">
						{isLoading || !isInitialized ? (
							<ProjectsSkeleton />
						) : projectsToDisplay.length === 0 ? (
							<EmptyState />
						) : (
							<div
								className={
									viewMode === "grid"
										? "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
										: "flex flex-col rounded-lg border border-border/50 bg-background/50 divide-y divide-border/40 overflow-hidden"
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
			</div>
		</div>
	);
}

function ProjectsHeader() {
	return (
		<header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 sm:px-8">
			<div className="max-w-7xl mx-auto flex items-center justify-between h-16">
				<div className="flex items-center gap-3">
					<div className="flex size-9 items-center justify-center rounded-lg bg-linear-270 from-[#2567EC] to-[#37B6F7] shadow-sm shadow-blue-500/20">
						<Image
							src={DEFAULT_LOGO_URL}
							alt="OpenCut Logo"
							width={22}
							height={22}
							className="invert brightness-200"
						/>
					</div>
					<div className="flex flex-col">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-base tracking-tight">OpenCut</span>
							<span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
								剪映版
							</span>
						</div>
						<span className="text-[11px] text-muted-foreground hidden sm:block">
							全能高效的在线智能视频创作平台
						</span>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<SearchBar className="hidden md:block w-64" />
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}

function HeroCreationSection() {
	const editor = useEditor();
	const router = useRouter();

	const handleCreateProject = async (initialTab?: string) => {
		try {
			const projectId = await editor.project.createNewProject({
				name: "新建草稿",
			});
			router.push(`/editor/${projectId}`);
		} catch (error) {
			toast.error("创建项目失败", {
				description: error instanceof Error ? error.message : "请重试",
			});
		}
	};

	return (
		<section className="flex flex-col gap-4">
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
				{/* JianYing Main "Start Creating" Hero Card */}
				<button
					type="button"
					onClick={() => handleCreateProject()}
					className="group lg:col-span-6 relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 via-blue-600/10 to-cyan-500/5 p-6 text-left shadow-md transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 active:translate-y-0"
				>
					<div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
					<div className="relative z-10 flex h-full flex-col justify-between gap-6">
						<div className="flex items-start justify-between">
							<div className="flex size-14 items-center justify-center rounded-xl bg-linear-270 from-[#2567EC] to-[#37B6F7] text-white shadow-md shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110">
								<HugeiconsIcon icon={ScissorIcon} className="size-7" />
							</div>
							<div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
								<HugeiconsIcon icon={SparklesIcon} className="size-3.5" />
								<span>点击立即开始</span>
							</div>
						</div>

						<div className="space-y-1">
							<h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
								开始创作
								<span className="text-primary transition-transform duration-300 group-hover:translate-x-1">→</span>
							</h2>
							<p className="text-xs sm:text-sm text-muted-foreground">
								导入视频、音频、图片开启多轨剪辑，极速导出 4K 高清视频
							</p>
						</div>
					</div>
				</button>

				{/* JianYing 4 Quick Tools Grid */}
				<div className="lg:col-span-6 grid grid-cols-2 gap-3">
					<QuickToolCard
						icon={ClosedCaptionIcon}
						title="智能字幕"
						desc="AI 语音转文字自动对齐"
						badge="智能识别"
						onClick={() => handleCreateProject("captions")}
					/>
					<QuickToolCard
						icon={Film01Icon}
						title="海量素材"
						desc="Pixabay 免版权 4K 视频库"
						badge="免费商用"
						onClick={() => handleCreateProject("stock")}
					/>
					<QuickToolCard
						icon={HeadphonesIcon}
						title="音效配乐"
						desc="流行音效与环境音效库"
						badge="丰富音源"
						onClick={() => handleCreateProject("sounds")}
					/>
					<QuickToolCard
						icon={SlidersHorizontalIcon}
						title="画布比例"
						desc="16:9 / 9:16 / 1:1 自由切换"
						badge="多平台适配"
						onClick={() => handleCreateProject("settings")}
					/>
				</div>
			</div>
		</section>
	);
}

function QuickToolCard({
	icon,
	title,
	desc,
	badge,
	onClick,
}: {
	icon: any;
	title: string;
	desc: string;
	badge: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="group relative flex flex-col justify-between gap-3 rounded-xl border border-border/50 bg-accent/25 hover:bg-accent/50 p-4 text-left transition-all duration-200 hover:border-border hover:shadow-sm"
		>
			<div className="flex items-center justify-between">
				<div className="flex size-10 items-center justify-center rounded-lg bg-foreground/5 text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
					<HugeiconsIcon icon={icon} className="size-5" />
				</div>
				<span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 rounded bg-muted/60">
					{badge}
				</span>
			</div>
			<div>
				<h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
					{title}
				</h3>
				<p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
					{desc}
				</p>
			</div>
		</button>
	);
}

const SORT_LABELS: Record<TProjectSortKey, string> = {
	updatedAt: "修改时间",
	createdAt: "创建时间",
	name: "项目名称",
	duration: "视频时长",
};

function ProjectsToolbar({
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
		viewMode,
		setViewMode,
	} = useProjectsStore();

	const selectedProjectCount = selectedProjectIds.length;
	const isAllSelected =
		projectIds.length > 0 && selectedProjectCount === projectIds.length;
	const hasSomeSelected =
		selectedProjectCount > 0 && selectedProjectCount < projectIds.length;

	const handleSelectAll = ({ checked }: { checked: boolean }) => {
		if (checked) {
			setSelectedProjects({ projectIds });
		} else {
			clearSelectedProjects();
		}
	};

	return (
		<div className="flex flex-col gap-3 pt-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h2 className="text-lg font-bold text-foreground flex items-center gap-2">
						本地草稿
						<span className="text-xs font-normal text-muted-foreground bg-accent/60 px-2 py-0.5 rounded-full">
							{totalCount}
						</span>
					</h2>
				</div>

				<div className="flex items-center gap-2.5">
					{/* Sort Dropdown */}
					<SortDropdown>
						<Button
							variant="outline"
							size="sm"
							className="h-8 gap-1.5 text-xs text-muted-foreground border-border/50"
						>
							<HugeiconsIcon icon={Clock01Icon} className="size-3.5" />
							<span>{SORT_LABELS[sortKey]}</span>
						</Button>
					</SortDropdown>

					<Button
						variant="outline"
						size="icon"
						className="size-8 text-muted-foreground border-border/50"
						onClick={() =>
							setSortOrder({
								sortOrder: sortOrder === "asc" ? "desc" : "asc",
							})
						}
						title={`排序方向 (${sortOrder === "asc" ? "升序" : "降序"})`}
					>
						<HugeiconsIcon
							icon={ArrowDown02Icon}
							className={cn("size-3.5 transition-transform", sortOrder === "asc" && "rotate-180")}
						/>
					</Button>

					{/* View Mode Toggle */}
					<div className="flex items-center rounded-md border border-border/50 bg-background/50 p-0.5">
						{VIEW_MODE_OPTIONS.map(({ mode, icon, label }) => (
							<Button
								key={mode}
								variant="ghost"
								size="icon"
								className={cn(
									"size-7 rounded-sm",
									viewMode === mode && "bg-accent text-foreground shadow-xs",
								)}
								onClick={() => setViewMode({ viewMode: mode })}
								title={label}
							>
								<HugeiconsIcon icon={icon} className="size-3.5" />
							</Button>
						))}
					</div>
				</div>
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
				className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
				aria-hidden="true"
			/>
			<Input
				placeholder="搜索草稿项目..."
				value={searchQuery}
				onChange={(event) => setSearchQuery({ query: event.target.value })}
				size="sm"
				className="pl-9 bg-accent/20 border-border/50 text-xs h-9 rounded-lg"
			/>
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
		.map((project) => project.metadata.name);

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
			<div className="sticky bottom-6 z-40 mx-auto flex items-center gap-3 rounded-full bg-background/95 border border-border/60 px-5 py-2.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
				<span className="text-xs font-medium text-foreground">
					已选择 <strong className="text-primary">{selectedProjectIds.length}</strong> 个草稿
				</span>
				<div className="h-4 w-px bg-border/60" />
				<Button
					size="sm"
					variant="outline"
					className="h-7 text-xs gap-1.5"
					onClick={handleDuplicateSelected}
				>
					<HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
					创建副本
				</Button>
				<Button
					size="sm"
					variant="destructive"
					className="h-7 text-xs gap-1.5"
					onClick={() => setIsDeleteDialogOpen(true)}
				>
					<HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
					批量删除
				</Button>
				<Button
					size="sm"
					variant="ghost"
					className="h-7 text-xs"
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
	const { sortKey, setSortKey } = useProjectsStore();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent className="w-44" align="end">
				<DropdownMenuCheckboxItem
					checked={sortKey === "updatedAt"}
					onCheckedChange={() => setSortKey({ sortKey: "updatedAt" })}
				>
					修改时间
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={sortKey === "createdAt"}
					onCheckedChange={() => setSortKey({ sortKey: "createdAt" })}
				>
					创建时间
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={sortKey === "name"}
					onCheckedChange={() => setSortKey({ sortKey: "name" })}
				>
					项目名称
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={sortKey === "duration"}
					onCheckedChange={() => setSortKey({ sortKey: "duration" })}
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
	const isMultiSelect = selectedProjectCount > 1;
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
		<div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-background/80 hover:bg-accent/20 transition-all duration-200 hover:border-primary/50 hover:shadow-md">
			{/* 16:9 Thumbnail Box */}
			<div className="relative aspect-video w-full overflow-hidden bg-muted/40">
				{project.thumbnail ? (
					<Image
						src={project.thumbnail}
						alt={project.name}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex size-full items-center justify-center bg-linear-to-br from-muted/30 to-muted/80">
						<OcVideoIcon className="text-muted-foreground/60 size-12 shrink-0" />
					</div>
				)}

				{/* Hover Dark Overlay & Center Edit Icon */}
				<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
						<HugeiconsIcon icon={PlayIcon} className="size-5 fill-current ml-0.5" />
					</div>
				</div>

				{/* Duration Pill Badge */}
				{durationLabel && (
					<div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-xs">
						{durationLabel}
					</div>
				)}
			</div>

			{/* Project Info Footer */}
			<div className="flex items-center justify-between p-3.5 gap-2">
				<div className="flex flex-col min-w-0 flex-1">
					<h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
						{project.name}
					</h3>
					<span className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
						<HugeiconsIcon icon={Clock01Icon} className="size-3" />
						{formatDate({ date: project.updatedAt || project.createdAt })}
					</span>
				</div>

				<div onClick={(e) => e.stopPropagation()}>
					<ProjectMenu
						isOpen={isDropdownOpen}
						onOpenChange={setIsDropdownOpen}
						variant="grid"
						onRenameClick={handleRename}
						onDuplicateClick={handleDuplicate}
						onDeleteClick={handleDeleteClick}
						onInfoClick={handleInfoClick}
					/>
				</div>
			</div>
		</div>
	);

	const listContent = (
		<div
			className={cn(
				"group flex items-center gap-4 py-3 px-4 transition-colors",
				isSelected ? "bg-primary/10" : "hover:bg-accent/40",
			)}
		>
			<Checkbox
				checked={isSelected}
				onMouseDown={(event) => event.preventDefault()}
				onClick={(event) => {
					handleCheckboxChange({
						checked: !isSelected,
						shiftKey: event.shiftKey,
					});
				}}
				onCheckedChange={() => {}}
				className="size-4 shrink-0"
			/>

			<Link href={`/editor/${project.id}`} className="flex items-center gap-3 flex-1 min-w-0">
				<div className="bg-muted relative size-12 rounded-lg overflow-hidden shrink-0 border border-border/40">
					{project.thumbnail ? (
						<Image
							src={project.thumbnail}
							alt={project.name}
							fill
							className="object-cover"
						/>
					) : (
						<div className="flex size-full items-center justify-center">
							<OcVideoIcon className="text-muted-foreground size-5 shrink-0" />
						</div>
					)}
				</div>

				<div className="flex flex-col min-w-0 flex-1">
					<h3 className="group-hover:text-primary text-sm font-medium truncate transition-colors">
						{project.name}
					</h3>
					<span className="text-muted-foreground text-xs block sm:hidden">
						{formatDate({ date: project.updatedAt || project.createdAt })}
					</span>
				</div>

				<span className="text-muted-foreground font-mono text-xs shrink-0 hidden sm:block">
					{durationLabel ?? "—"}
				</span>

				<span className="text-muted-foreground text-xs shrink-0 w-32 text-right hidden md:block">
					{formatDate({ date: project.updatedAt || project.createdAt })}
				</span>
			</Link>

			<div onClick={(e) => e.stopPropagation()}>
				<ProjectMenu
					isOpen={isDropdownOpen}
					onOpenChange={setIsDropdownOpen}
					variant="list"
					onRenameClick={handleRename}
					onDuplicateClick={handleDuplicate}
					onDeleteClick={handleDeleteClick}
					onInfoClick={handleInfoClick}
				/>
			</div>
		</div>
	);

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<div className="group relative">
						{isGridView ? (
							<Link href={`/editor/${project.id}`} className="block">
								{gridContent}
							</Link>
						) : (
							listContent
						)}
					</div>
				</ContextMenuTrigger>
				<ProjectContextMenuContent
					onRenameClick={handleRename}
					onDuplicateClick={handleDuplicate}
					onDeleteClick={handleDeleteClick}
					onInfoClick={handleInfoClick}
				/>
			</ContextMenu>

			<RenameProjectDialog
				isOpen={isRenameDialogOpen}
				onOpenChange={setIsRenameDialogOpen}
				projectName={project.name}
				onConfirm={async (newName) => {
					await renameProject({ editor, id: project.id, name: newName });
					setIsRenameDialogOpen(false);
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
	isOpen,
	onOpenChange,
	variant,
	onRenameClick,
	onDuplicateClick,
	onDeleteClick,
	onInfoClick,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	variant: "grid" | "list";
	onRenameClick: () => void;
	onDuplicateClick: () => void;
	onDeleteClick: () => void;
	onInfoClick: () => void;
}) {
	return (
		<DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon"
					variant="ghost"
					className="size-7 rounded-md text-muted-foreground hover:text-foreground"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-40" align="end">
				<DropdownMenuItem onClick={onRenameClick}>
					<HugeiconsIcon icon={Edit03Icon} className="size-4" />
					重命名
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onDuplicateClick}>
					<HugeiconsIcon icon={Copy01Icon} className="size-4" />
					创建副本
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onInfoClick}>
					<HugeiconsIcon icon={InformationCircleIcon} className="size-4" />
					草稿详情
				</DropdownMenuItem>
				<ContextMenuSeparator />
				<DropdownMenuItem variant="destructive" onClick={onDeleteClick}>
					<HugeiconsIcon icon={Delete02Icon} className="size-4" />
					删除草稿
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ProjectContextMenuContent({
	onRenameClick,
	onDuplicateClick,
	onDeleteClick,
	onInfoClick,
}: {
	onRenameClick: () => void;
	onDuplicateClick: () => void;
	onDeleteClick: () => void;
	onInfoClick: () => void;
}) {
	return (
		<ContextMenuContent className="w-44">
			<ContextMenuItem onClick={onRenameClick}>
				<HugeiconsIcon icon={Edit03Icon} className="size-4" />
				重命名
			</ContextMenuItem>
			<ContextMenuItem onClick={onDuplicateClick}>
				<HugeiconsIcon icon={Copy01Icon} className="size-4" />
				创建副本
			</ContextMenuItem>
			<ContextMenuItem onClick={onInfoClick}>
				<HugeiconsIcon icon={InformationCircleIcon} className="size-4" />
				草稿详情
			</ContextMenuItem>
			<ContextMenuSeparator />
			<ContextMenuItem variant="destructive" onClick={onDeleteClick}>
				<HugeiconsIcon icon={Delete02Icon} className="size-4" />
				删除草稿
			</ContextMenuItem>
		</ContextMenuContent>
	);
}

function ProjectsSkeleton() {
	const skeletonIds = Array.from({ length: 8 }, (_, index) => `skeleton-${index}`);

	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{skeletonIds.map((skeletonId) => (
				<div key={skeletonId} className="flex flex-col gap-3 rounded-xl border border-border/40 p-2">
					<Skeleton className="aspect-video w-full rounded-lg" />
					<div className="space-y-1.5 px-1 pb-1">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
}

function EmptyState() {
	const { searchQuery, setSearchQuery } = useProjectsStore();
	const router = useRouter();
	const editor = useEditor();
	const savedProjects = editor.project.getSavedProjects();

	const handleCreateProject = async () => {
		try {
			const projectId = await editor.project.createNewProject({
				name: "新建草稿",
			});
			router.push(`/editor/${projectId}`);
		} catch (error) {
			toast.error("创建草稿失败", {
				description: error instanceof Error ? error.message : "请重试",
			});
		}
	};

	if (savedProjects.length > 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
				<div className="flex size-14 items-center justify-center rounded-2xl bg-accent/40 border border-border/50 text-muted-foreground">
					<HugeiconsIcon icon={Search01Icon} className="size-7" />
				</div>
				<div className="space-y-1">
					<h3 className="text-base font-semibold text-foreground">未搜索到相关草稿</h3>
					<p className="text-xs text-muted-foreground">
						未找到与 "{searchQuery}" 相关的草稿项目
					</p>
				</div>
				<Button
					onClick={() => setSearchQuery({ query: "" })}
					variant="outline"
					size="sm"
					className="text-xs"
				>
					清空搜索
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center gap-5 py-16 text-center border border-dashed border-border/60 rounded-2xl bg-accent/10">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
				<HugeiconsIcon icon={Video01Icon} className="size-8" />
			</div>
			<div className="space-y-1.5 max-w-sm">
				<h3 className="text-lg font-bold text-foreground">开启您的第一次剪辑创作</h3>
				<p className="text-xs text-muted-foreground">
					支持导入多格式音视频与图片，多轨道时间线剪辑，所有数据在浏览器本地私密运行。
				</p>
			</div>
			<Button size="default" className="gap-2 px-6 shadow-sm" onClick={handleCreateProject}>
				<HugeiconsIcon icon={PlusSignIcon} className="size-4" />
				新建第一个草稿
			</Button>
		</div>
	);
}
