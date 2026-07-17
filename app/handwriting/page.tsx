'use client';

import { useState, useCallback } from 'react';
import { RotateCcw, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ExportPanel } from '@/components/common/ExportPanel';
import { PreviewCanvas } from '@/components/common/PreviewCanvas';
import { SettingGroup } from '@/components/common/SettingGroup';
import { SettingsPanel } from '@/components/common/SettingsPanel';
import { SliderRow } from '@/components/common/SliderRow';
import { useCanvas } from '@/hooks/useCanvas';
import { useExport } from '@/hooks/useExport';
import { useFontLoader } from '@/hooks/useFontLoader';
import { usePersistentState } from '@/hooks/usePersistentState';
import { drawHandwriting } from '@/lib/handwriting';
import { renderAtScale } from '@/lib/canvas';
import { getCanvasSize, PAPER_SIZES } from '@/lib/paper';
import { FONTS } from '@/lib/fonts';
import type { HandwritingSettings, Margin } from '@/types';

const PAPER_BACKGROUNDS = [
  { value: 'white', label: '白纸' },
  { value: 'lined', label: '横线稿纸' },
  { value: 'grid', label: '方格稿纸' },
  { value: 'dot', label: '点阵纸' },
  { value: 'yellow', label: '米黄护眼' },
  { value: 'aged', label: '做旧纸张' },
] as const;

const HANDWRITING_FONTS = ['longcang', 'zhimang', 'mashan', 'wenkai', 'kaiti', 'song'] as const;

const DEFAULT_SETTINGS: HandwritingSettings = {
  content: '滕王阁序\n豫章故郡，洪都新府。星分翼轸，地接衡庐。\n襟三江而带五湖，控蛮荆而引瓯越。',
  fontFamily: 'longcang',
  paperBackground: 'lined',
  distortionLevel: 8,
  positionChaos: 10,
  strokeChaos: 5,
  scribbleRate: 3,
  inkColor: '#1a1a1a',
  fontSize: 26,
  letterSpacing: 2,
  cols: 0,
  lineSpacing: 40,
  paperSize: PAPER_SIZES[0],
  margin: { top: 30, right: 30, bottom: 30, left: 30 },
};

export default function HandwritingPage() {
  const [settings, setSettings] = usePersistentState<HandwritingSettings>('ws:handwriting', DEFAULT_SETTINGS);
  const [seed, setSeed] = useState<number>(() => 20260717);
  const [ocrBusy, setOcrBusy] = useState(false);
  const fontReady = useFontLoader(settings.fontFamily);
  const { exportPDF, exportPNG } = useExport();
  const canvasSize = getCanvasSize(settings.paperSize);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!fontReady) return; // 字体未就绪先不画，避免回退字重绘抖动
      drawHandwriting(ctx, width, height, settings, seed);
    },
    [settings, seed, fontReady]
  );

  const { canvasRef } = useCanvas({
    width: canvasSize.width,
    height: canvasSize.height,
    onDraw: draw,
  });

  const updateSetting = <K extends keyof HandwritingSettings>(
    key: K,
    value: HandwritingSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateMargin = (key: keyof Margin, value: number) => {
    setSettings((prev) => ({ ...prev, margin: { ...prev.margin, [key]: value } }));
  };

  const regenerate = () => setSeed(Date.now());

  // 高清离屏重绘（2x，导出更清晰）
  const exportHiRes = (scale: number) =>
    renderAtScale(draw, canvasSize.width, canvasSize.height, scale);

  // 文件上传取文本：.txt 直读，.docx 走 mammoth（动态加载）
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/');
    try {
      if (isImage) {
        setOcrBusy(true);
        const Tesseract = await import('tesseract.js');
        const worker = await Tesseract.createWorker('chi_sim+eng', 1, { logger: () => {} });
        try {
          const {
            data: { text },
          } = await worker.recognize(file);
          updateSetting('content', text.trim());
        } finally {
          await worker.terminate();
        }
      } else if (name.endsWith('.txt') || file.type.startsWith('text/')) {
        updateSetting('content', await file.text());
      } else if (name.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const buf = await file.arrayBuffer();
        const res = await mammoth.extractRawText({ arrayBuffer: buf });
        updateSetting('content', res.value);
      } else if (name.endsWith('.pdf')) {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        const data = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data }).promise;
        let text = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((it) => ('str' in it ? it.str : '')).join('') + '\n';
        }
        updateSetting('content', text.trim());
      } else {
        alert('暂仅支持 .txt / .docx / .pdf / 图片');
      }
    } catch (e) {
      alert('解析失败：' + (e as Error).message);
    } finally {
      setOcrBusy(false);
    }
  };

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden">
      <PreviewCanvas canvasRef={canvasRef} />

      <SettingsPanel>
        <h1 className="text-xl font-bold">手写模拟器</h1>

        <ExportPanel
          onPDF={() => exportPDF(exportHiRes(2), 'handwriting.pdf', settings.paperSize)}
          onPNG={() => exportPNG(exportHiRes(2), 'handwriting.png')}
        />

        <Button onClick={regenerate} variant="secondary" className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          重新生成（换随机种子）
        </Button>

        <Separator />

        <SettingGroup title="内容">
          <div className="space-y-2">
            <Label>输入内容</Label>
            <Textarea
              value={settings.content}
              onChange={(e) => updateSetting('content', e.target.value)}
              rows={6}
              placeholder="粘贴任意文本..."
            />
          </div>

          <div className="space-y-2">
            <Label>从文件导入（.txt / .docx / .pdf / 图片）</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
              <Upload className="h-4 w-4" />
              {ocrBusy ? '识别中…（首次需下载识别库，较慢）' : '选择文件'}
              <input
                type="file"
                accept=".txt,.docx,.pdf,text/plain,image/*"
                className="hidden"
                disabled={ocrBusy}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label>手写字体</Label>
            <Select value={settings.fontFamily} onValueChange={(v) => updateSetting('fontFamily', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HANDWRITING_FONTS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {FONTS[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>纸张背景</Label>
            <Select
              value={settings.paperBackground}
              onValueChange={(v) =>
                updateSetting('paperBackground', v as HandwritingSettings['paperBackground'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_BACKGROUNDS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SettingGroup>

        <SettingGroup title="手写效果">
          <SliderRow
            label="字形变形"
            value={settings.distortionLevel}
            onChange={(v) => updateSetting('distortionLevel', v)}
            minLabel="端正"
            maxLabel="变形"
            recommend={8}
          />
          <SliderRow
            label="位置凌乱"
            value={settings.positionChaos}
            onChange={(v) => updateSetting('positionChaos', v)}
            minLabel="整齐"
            maxLabel="凌乱"
            recommend={10}
          />
          <SliderRow
            label="笔画凌乱"
            value={settings.strokeChaos}
            onChange={(v) => updateSetting('strokeChaos', v)}
            minLabel="工整"
            maxLabel="歪扭"
            recommend={5}
          />
          <SliderRow
            label="涂改概率"
            value={settings.scribbleRate}
            onChange={(v) => updateSetting('scribbleRate', v)}
            minLabel="无瑕"
            maxLabel="涂改"
            recommend={3}
          />
        </SettingGroup>

        <SettingGroup title="排版">
          <SliderRow
            label="字号"
            value={settings.fontSize}
            onChange={(v) => updateSetting('fontSize', v)}
            min={12}
            max={60}
            step={1}
            unit="px"
          />
          <SliderRow
            label="行距"
            value={settings.lineSpacing}
            onChange={(v) => updateSetting('lineSpacing', v)}
            min={20}
            max={80}
            step={1}
            unit="px"
          />
          <SliderRow
            label="字间距"
            value={settings.letterSpacing}
            onChange={(v) => updateSetting('letterSpacing', v)}
            min={0}
            max={20}
            step={0.5}
            unit="px"
            recommend={2}
          />
          <SliderRow
            label="每行字数"
            value={settings.cols}
            onChange={(v) => updateSetting('cols', v)}
            min={0}
            max={30}
            step={1}
            unit="字"
            recommend={0}
          />
          <div className="space-y-2">
            <Label>墨色</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.inkColor}
                onChange={(e) => updateSetting('inkColor', e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent"
              />
              <Input
                value={settings.inkColor}
                onChange={(e) => updateSetting('inkColor', e.target.value)}
              />
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="纸张与边距">
          <div className="space-y-2">
            <Label>纸张尺寸</Label>
            <Select
              value={settings.paperSize.name}
              onValueChange={(v) => {
                const size = PAPER_SIZES.find((s) => s.name === v);
                if (size) updateSetting('paperSize', size);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_SIZES.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['top', 'right', 'bottom', 'left'] as const).map((k) => (
              <div key={k} className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {{ top: '上', right: '右', bottom: '下', left: '左' }[k]}
                </Label>
                <Input
                  type="number"
                  value={settings.margin[k]}
                  onChange={(e) => updateMargin(k, Number(e.target.value))}
                  min={0}
                  step={1}
                />
              </div>
            ))}
          </div>
        </SettingGroup>
      </SettingsPanel>
    </main>
  );
}
