import { HandwritingSimLoader } from "./_components/handwriting-sim-loader";

// 服务端组件：仅渲染客户端壳（壳内部用 next/dynamic ssr:false 按需加载模拟器）。
export default function HandwritingPage() {
  return <HandwritingSimLoader />;
}
