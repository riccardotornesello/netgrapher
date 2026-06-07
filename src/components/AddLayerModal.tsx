import React, { useEffect } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { LayerType } from '../types';
import { 
  X, Layers, Activity, Box, Maximize, 
  GitCommit, Menu, CircleDashed, Sliders 
} from 'lucide-react';

export function AddLayerModal() {
  const { addModalTarget, setAddModalTarget, addLayer } = useNetwork();

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAddModalTarget(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setAddModalTarget]);

  if (!addModalTarget) return null;

  const handleSelectLayer = (type: LayerType) => {
    addLayer(type, addModalTarget.parentId, addModalTarget.index);
    setAddModalTarget(null);
  };

  const categories = [
    {
      title: 'Convolutions',
      items: [
        {
          type: 'conv2d' as LayerType,
          label: 'Conv2D',
          desc: 'Extracts 2D spatial features (images).',
          icon: <Layers className="w-4 h-4 text-indigo-400" />,
          colorGrid: 'hover:border-indigo-500/50 hover:bg-indigo-950/10'
        },
        {
          type: 'conv3d' as LayerType,
          label: 'Conv3D',
          desc: 'Extracts 3D spatial features (volumes, video).',
          icon: <Layers className="w-4 h-4 text-indigo-300" />,
          colorGrid: 'hover:border-indigo-400/50 hover:bg-indigo-900/10'
        }
      ]
    },
    {
      title: 'Pooling',
      items: [
        {
          type: 'maxpool2d' as LayerType,
          label: 'MaxPool2D',
          desc: '2D spatial downsampling, extracts maximum values.',
          icon: <Maximize className="w-4 h-4 text-orange-400" />,
          colorGrid: 'hover:border-orange-500/50 hover:bg-orange-950/10'
        },
        {
          type: 'maxpool3d' as LayerType,
          label: 'MaxPool3D',
          desc: '3D spatial downsampling, extracts maximum values.',
          icon: <Maximize className="w-4 h-4 text-orange-300" />,
          colorGrid: 'hover:border-orange-400/50 hover:bg-orange-900/10'
        }
      ]
    },
    {
      title: 'Normalization',
      items: [
        {
          type: 'batchnorm2d' as LayerType,
          label: 'BatchNorm2D',
          desc: 'Normalizes the channels of a 2D feature map.',
          icon: <Sliders className="w-4 h-4 text-cyan-400" />,
          colorGrid: 'hover:border-cyan-500/50 hover:bg-cyan-950/10'
        },
        {
          type: 'batchnorm3d' as LayerType,
          label: 'BatchNorm3D',
          desc: 'Normalizes the channels of a 3D feature map.',
          icon: <Sliders className="w-4 h-4 text-cyan-300" />,
          colorGrid: 'hover:border-cyan-400/50 hover:bg-cyan-900/10'
        }
      ]
    },
    {
      title: 'Activation and Regularization',
      items: [
        {
          type: 'relu' as LayerType,
          label: 'ReLU',
          desc: 'Applies the Rectified Linear Unit non-linearity.',
          icon: <Activity className="w-4 h-4 text-emerald-400" />,
          colorGrid: 'hover:border-emerald-500/50 hover:bg-emerald-950/10'
        },
        {
          type: 'sigmoid' as LayerType,
          label: 'Sigmoid',
          desc: 'Maps input to a smooth (0, 1) probability range.',
          icon: <Activity className="w-4 h-4 text-emerald-300" />,
          colorGrid: 'hover:border-emerald-450/50 hover:bg-emerald-900/10'
        },
        {
          type: 'tanh' as LayerType,
          label: 'Tanh',
          desc: 'Maps input symmetrically to a smooth (-1, 1) range.',
          icon: <Activity className="w-4 h-4 text-teal-400" />,
          colorGrid: 'hover:border-teal-500/50 hover:bg-teal-950/10'
        },
        {
          type: 'leaky_relu' as LayerType,
          label: 'Leaky ReLU',
          desc: 'Allows small activation gradient slope (0.01) for negatives.',
          icon: <Activity className="w-4 h-4 text-teal-300" />,
          colorGrid: 'hover:border-teal-400/50 hover:bg-teal-900/10'
        },
        {
          type: 'elu' as LayerType,
          label: 'ELU',
          desc: 'Smooths exponential scaling for negative activation fields.',
          icon: <Activity className="w-4 h-4 text-green-400" />,
          colorGrid: 'hover:border-green-500/50 hover:bg-green-950/10'
        },
        {
          type: 'gelu' as LayerType,
          label: 'GELU',
          desc: 'Gaussian Error Linear activation, widely used in Transformers.',
          icon: <Activity className="w-4 h-4 text-green-300" />,
          colorGrid: 'hover:border-green-400/50 hover:bg-green-900/10'
        },
        {
          type: 'dropout' as LayerType,
          label: 'Dropout',
          desc: 'Randomly drops units to prevent overfitting.',
          icon: <CircleDashed className="w-4 h-4 text-red-400" />,
          colorGrid: 'hover:border-red-500/50 hover:bg-red-950/10'
        }
      ]
    },
    {
      title: 'Representation and Dense',
      items: [
        {
          type: 'flatten' as LayerType,
          label: 'Flatten',
          desc: 'Flattens the multi-dimensional input into 1D.',
          icon: <Menu className="w-4 h-4 text-yellow-400" />,
          colorGrid: 'hover:border-yellow-500/50 hover:bg-yellow-950/10'
        },
        {
          type: 'linear' as LayerType,
          label: 'Linear / Dense',
          desc: 'Fully connected layer for final outputs.',
          icon: <GitCommit className="w-4 h-4 text-purple-400" />,
          colorGrid: 'hover:border-purple-500/50 hover:bg-purple-950/10'
        }
      ]
    },
    {
      title: 'Structuring',
      items: [
        {
          type: 'group' as LayerType,
          label: 'Coherent Group',
          desc: 'Container to encapsulate and organize multiple sub-layers.',
          icon: <Box className="w-4 h-4 text-blue-400" />,
          colorGrid: 'hover:border-blue-500/50 hover:bg-blue-950/10'
        }
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setAddModalTarget(null)}
    >
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-zinc-100 uppercase">
              Select Layer to Add
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Insert at the desired position of the neural architecture
            </p>
          </div>
          <button 
            onClick={() => setAddModalTarget(null)}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-[#0c0d10] custom-scrollbar">
          {categories.map((category) => (
            <div key={category.title} className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                {category.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.items.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleSelectLayer(item.type)}
                    className={`flex items-start text-left gap-3.5 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/80 hover:scale-[1.01] transition-all cursor-pointer ${item.colorGrid}`}
                  >
                    <div className="p-2 rounded-md bg-zinc-850 mt-0.5 shrink-0">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-zinc-200">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
