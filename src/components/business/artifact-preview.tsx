import type { Artifact, ArtifactType } from "@/types/artifact";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileImage, FileText, Download, Upload, Code, ScrollText } from "lucide-react";

const typeIcons: Record<ArtifactType, React.ElementType> = {
  screenshot: FileImage,
  download: Download,
  upload: Upload,
  trace: Code,
  dom_snapshot: Code,
  log: ScrollText,
};

const typeLabels: Record<ArtifactType, string> = {
  screenshot: "截图",
  download: "下载文件",
  upload: "上传文件",
  trace: "Trace",
  dom_snapshot: "DOM 快照",
  log: "日志",
};

export function ArtifactPreview({ artifact }: { artifact: Artifact }) {
  const Icon = typeIcons[artifact.type] ?? FileText;

  if (artifact.type === "screenshot") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{artifact.name}</span>
            <Badge variant="outline">{typeLabels[artifact.type]}</Badge>
          </div>
          <div className="flex h-40 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <div className="text-center">
              <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">截图占位预览</p>
              <p className="text-xs">{artifact.sizeText}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{artifact.name}</p>
          <p className="text-xs text-muted-foreground">
            {typeLabels[artifact.type]} · {artifact.sizeText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ArtifactList({ artifacts }: { artifacts: Artifact[] }) {
  if (artifacts.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无证据</p>;
  }
  return (
    <div className="space-y-2">
      {artifacts.map((a) => (
        <ArtifactPreview key={a.id} artifact={a} />
      ))}
    </div>
  );
}
