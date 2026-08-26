import { ProjectsView } from "@/project/components/projects-view";
import type { Metadata } from "next";
import { SITE_URL } from "@/site/brand";

export const metadata: Metadata = {
	title: "OpenCut - Projects",
	alternates: {
		canonical: SITE_URL,
	},
};

export default function Home() {
	return <ProjectsView />;
}

