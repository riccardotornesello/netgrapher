import { LayerCategory } from "../types";

export interface LayerGroupInfo {
  name: string;
  description?: string;
  /** Tailwind color token used for theming in UI (e.g. "indigo", "emerald") */
  colorToken: string;
  /** Exclude this group from the educational wiki */
  wikiExcluded?: boolean;
}

export const LAYER_GROUPS: Record<LayerCategory, LayerGroupInfo> = {
  Convolutional: {
    name: "Convolutions",
    description: "Learnable filters that slide over spatial inputs to extract local features.",
    colorToken: "indigo",
  },
  Pooling: {
    name: "Pooling",
    description: "Spatial downsampling operations that reduce dimensionality.",
    colorToken: "orange",
  },
  Normalization: {
    name: "Normalization",
    description: "Stabilize training by normalizing activations across channels or batches.",
    colorToken: "cyan",
  },
  Activation: {
    name: "Activation Functions",
    description: "Non-linear transformations applied element-wise to introduce expressivity.",
    colorToken: "emerald",
  },
  Regularization: {
    name: "Regularization",
    description: "Techniques to reduce overfitting during training.",
    colorToken: "red",
  },
  "Linear & Structural": {
    name: "Representation and Dense",
    description: "Fully connected layers and shape transformations.",
    colorToken: "purple",
  },
  Structuring: {
    name: "Structuring",
    description: "Container nodes to organize and encapsulate sub-networks.",
    colorToken: "blue",
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
