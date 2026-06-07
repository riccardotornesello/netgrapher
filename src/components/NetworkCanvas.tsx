import { useNetwork } from "../context/NetworkContext";
import { LayerList } from "./LayerList";
import { ShapeToken } from "./ShapeToken";
import { InputBlock } from "./InputBlock";

export function NetworkCanvas() {
  const { layers, inputShape, setSelectedNodeId } = useNetwork();

  return (
    <div
      className="flex flex-col items-center min-h-full pb-32"
      onClick={() => setSelectedNodeId(null)} // Clicking canvas unselects
    >
      {/* Interactive, beautiful Input Block */}
      <InputBlock />

      <ShapeToken shape={inputShape} />

      <div className="w-full max-w-xl">
        <LayerList nodes={layers} initialShape={inputShape} />
      </div>
    </div>
  );
}
