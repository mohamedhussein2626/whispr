import PDFPageWithSidebar from "@/components/dashboard/PDFPageWithSidebar";
import { db } from "@/db";

type PageProps = {
  params: Promise<{ fileId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { fileId } = await params;
  const file = await db.file.findFirst({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    return <div className="p-6">File not found.</div>;
  }

  // Move state to a client component wrapper
  return <PDFPageWithSidebar file={file} />;
}
