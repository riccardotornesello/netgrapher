import { LayerCategory } from "../types";

export interface LayerGroupInfo {
  name: string;
  description?: string;
  colorToken: string;
  iconColorClass: string;
  hoverColorClass: string;
  wikiExcluded?: boolean;
}

export const LAYER_GROUPS: Record<LayerCategory, LayerGroupInfo> = {
  Convolutional: {
    name: "Convolutions",
    description: "Learnable filters that slide over spatial inputs to extract local features.",
    colorToken: "indigo",
    iconColorClass: "text-indigo-400",
    hoverColorClass: "hover:border-indigo-500/50 hover:bg-indigo-950/10",
  },
  Pooling: {
    name: "Pooling",
    description: "Spatial downsampling operations that reduce dimensionality.",
    colorToken: "orange",
    iconColorClass: "text-orange-400",
    hoverColorClass: "hover:border-orange-500/50 hover:bg-orange-950/10",
  },
  Normalization: {
    name: "Normalization",
    description: "Stabilize training by normalizing activations across channels or batches.",
    colorToken: "cyan",
    iconColorClass: "text-cyan-400",
    hoverColorClass: "hover:border-cyan-500/50 hover:bg-cyan-950/10",
  },
  Activation: {
    name: "Activation Functions",
    description: "Non-linear transformations applied element-wise to introduce expressivity.",
    colorToken: "emerald",
    iconColorClass: "text-emerald-400",
    hoverColorClass: "hover:border-emerald-500/50 hover:bg-emerald-950/10",
  },
  Regularization: {
    name: "Regularization",
    description: "Techniques to reduce overfitting during training.",
    colorToken: "red",
    iconColorClass: "text-red-400",
    hoverColorClass: "hover:border-red-500/50 hover:bg-red-950/10",
  },
  "Linear & Structural": {
    name: "Representation and Dense",
    description: "Fully connected layers and shape transformations.",
    colorToken: "purple",
    iconColorClass: "text-purple-400",
    hoverColorClass: "hover:border-purple-500/50 hover:bg-purple-950/10",
  },
  Structuring: {
    name: "Structuring",
    description: "Container nodes to organize and encapsulate sub-networks.",
    colorToken: "blue",
    iconColorClass: "text-blue-400",
    hoverColorClass: "hover:border-blue-500/50 hover:bg-blue-950/10",
    wikiExcluded: true,
  },
};

export const LAYER_GROUP_ORDER: LayerCategory[] = [
  "Convolutional",
  "Pooling",
  "Normalization",
  "Activation",
  "Regularization",
  "Linear & Structural",
  "Structuring",
];
