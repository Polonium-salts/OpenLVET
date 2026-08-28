import type { ShortcutKey } from "@/actions/keybinding";
import type { TActionWithOptionalArgs } from "./types";

export type TActionCategory =
	| "播放控制"
	| "时间导航"
	| "剪辑操作"
	| "选择与多选"
	| "历史记录"
	| "时间线标记"
	| "基础控制"
	| "资产管理";

export interface TActionBaseDefinition {
	description: string;
	category: TActionCategory;
	args?: Record<string, unknown>;
}

export interface TActionDefinition extends TActionBaseDefinition {
	defaultShortcuts?: readonly ShortcutKey[];
}

export const ACTIONS = {
	"toggle-play": {
		description: "播放 / 暂停",
		category: "播放控制",
	},
	"stop-playback": {
		description: "停止播放",
		category: "播放控制",
	},
	"seek-forward": {
		description: "快进 1 秒",
		category: "播放控制",
		args: { seconds: "number" },
	},
	"seek-backward": {
		description: "快退 1 秒",
		category: "播放控制",
		args: { seconds: "number" },
	},
	"frame-step-forward": {
		description: "向前一帧",
		category: "时间导航",
	},
	"frame-step-backward": {
		description: "向后一帧",
		category: "时间导航",
	},
	"jump-forward": {
		description: "快进 5 秒",
		category: "时间导航",
		args: { seconds: "number" },
	},
	"jump-backward": {
		description: "快退 5 秒",
		category: "时间导航",
		args: { seconds: "number" },
	},
	"goto-start": {
		description: "跳至时间线起点",
		category: "时间导航",
	},
	"goto-end": {
		description: "跳至时间线终点",
		category: "时间导航",
	},
	split: {
		description: "在播放头处分割片段",
		category: "剪辑操作",
	},
	"split-left": {
		description: "分割并删除左侧片段",
		category: "剪辑操作",
	},
	"split-right": {
		description: "分割并删除右侧片段",
		category: "剪辑操作",
	},
	"delete-selected": {
		description: "删除选中的片段",
		category: "剪辑操作",
	},
	"copy-selected": {
		description: "复制选中的片段",
		category: "剪辑操作",
	},
	"paste-copied": {
		description: "在播放头处粘贴片段",
		category: "剪辑操作",
	},
	"toggle-snapping": {
		description: "开启 / 关闭自动吸附",
		category: "剪辑操作",
	},
	"toggle-ripple-editing": {
		description: "开启 / 关闭波纹编辑",
		category: "剪辑操作",
	},
	"toggle-source-audio": {
		description: "分离或恢复原片音频",
		category: "剪辑操作",
	},
	"select-all": {
		description: "全选所有片段",
		category: "选择与多选",
	},
	"cancel-interaction": {
		description: "取消当前交互 / 退出编辑",
		category: "基础控制",
	},
	"deselect-all": {
		description: "取消全选",
		category: "选择与多选",
	},
	"duplicate-selected": {
		description: "快速创建副本",
		category: "选择与多选",
	},
	"toggle-elements-muted-selected": {
		description: "静音 / 取消静音选中片段",
		category: "选择与多选",
	},
	"toggle-elements-visibility-selected": {
		description: "隐藏 / 显示选中片段",
		category: "选择与多选",
	},
	"toggle-bookmark": {
		description: "在播放头处添加 / 移除标记",
		category: "时间线标记",
	},
	undo: {
		description: "撤销上一步操作",
		category: "历史记录",
	},
	redo: {
		description: "重做下一步操作",
		category: "历史记录",
	},
	"remove-media-asset": {
		description: "移除媒体素材",
		category: "资产管理",
		args: { projectId: "string", assetId: "string" },
	},
	"remove-media-assets": {
		description: "批量移除媒体素材",
		category: "资产管理",
		args: { projectId: "string", assetIds: "string[]" },
	},
} as const satisfies Record<string, TActionBaseDefinition>;

export type TAction = keyof typeof ACTIONS;

const ACTION_DEFAULT_SHORTCUTS = [
	["toggle-play", ["space", "k"]],
	["seek-forward", ["l"]],
	["seek-backward", ["j"]],
	["frame-step-forward", ["right"]],
	["frame-step-backward", ["left"]],
	["jump-forward", ["shift+right"]],
	["jump-backward", ["shift+left"]],
	["goto-start", ["home", "enter"]],
	["goto-end", ["end"]],
	["split", ["s"]],
	["split-left", ["q"]],
	["split-right", ["w"]],
	["delete-selected", ["backspace", "delete"]],
	["copy-selected", ["ctrl+c"]],
	["paste-copied", ["ctrl+v"]],
	["toggle-snapping", ["n"]],
	["select-all", ["ctrl+a"]],
	["cancel-interaction", ["escape"]],
	["duplicate-selected", ["ctrl+d"]],
	["undo", ["ctrl+z"]],
	["redo", ["ctrl+shift+z", "ctrl+y"]],
] as const satisfies ReadonlyArray<
	readonly [TActionWithOptionalArgs, readonly ShortcutKey[]]
>;

const ACTION_DEFAULT_SHORTCUTS_BY_ACTION = new Map<
	TAction,
	readonly ShortcutKey[]
>(ACTION_DEFAULT_SHORTCUTS);

export function getActionDefinition({
	action,
}: {
	action: TAction;
}): TActionDefinition {
	return {
		...ACTIONS[action],
		defaultShortcuts: ACTION_DEFAULT_SHORTCUTS_BY_ACTION.get(action),
	};
}

export function getDefaultShortcuts(): Map<
	ShortcutKey,
	TActionWithOptionalArgs
> {
	const shortcuts = new Map<ShortcutKey, TActionWithOptionalArgs>();

	for (const [action, defaultShortcuts] of ACTION_DEFAULT_SHORTCUTS) {
		for (const shortcut of defaultShortcuts) {
			shortcuts.set(shortcut, action);
		}
	}

	return shortcuts;
}

export function isActionWithOptionalArgs(
	value: string,
): value is TActionWithOptionalArgs {
	return value in ACTIONS;
}
