import { ProjectsView } from "@/project/components/projects-view";
import { OpenLVETErrorBoundary } from "@/components/error-boundary";
import type { Metadata } from "next";
import { SITE_URL } from "@/site/brand";

export const metadata: Metadata = {
	title: "OpenLVET - Projects",
	alternates: {
		canonical: SITE_URL,
	},
};

export default function Home() {
	return (
		<OpenLVETErrorBoundary module="ProjectsPage">
			<ProjectsView />
		</OpenLVETErrorBoundary>
	);
}


