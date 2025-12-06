import { db } from "@/db";
import { getSession } from "@/lib/getSession";
import TopicViewPage from "@/components/dashboard/TopicViewPage";

type PageProps = {
  params: Promise<{ topicId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { topicId } = await params;
  const session = await getSession();
  
  if (!session) {
    return <div className="p-6">Unauthorized</div>;
  }

  // Verify topic ownership and get topic with files
  const topic = await db.libraryTopic.findFirst({
    where: { 
      id: topicId, 
      userId: session.user.id 
    },
    include: {
      files: {
        where: {
          source: {
            notIn: ["essay_writer", "essay_grader"],
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!topic) {
    return <div className="p-6">Topic not found or access denied.</div>;
  }

  return <TopicViewPage topic={topic} files={topic.files} />;
}

