import { LayerModule } from '../types';

import * as Conv2D from './Conv2D';
import * as Conv3D from './Conv3D';
import * as ReLU from './ReLU';
import * as Sigmoid from './Sigmoid';
import * as Tanh from './Tanh';
import * as LeakyReLU from './LeakyReLU';
import * as ELU from './ELU';
import * as GELU from './GELU';
import * as MaxPool2D from './MaxPool2D';
import * as MaxPool3D from './MaxPool3D';
import * as Linear from './Linear';
import * as Flatten from './Flatten';
import * as Dropout from './Dropout';
import * as BatchNorm2D from './BatchNorm2D';
import * as BatchNorm3D from './BatchNorm3D';

export const LAYERS: Record<string, LayerModule> = {
  conv2d: { info: Conv2D.info, InteractiveSimulator: Conv2D.InteractiveSimulator },
  conv3d: { info: Conv3D.info, InteractiveSimulator: Conv3D.InteractiveSimulator },
  relu: { info: ReLU.info, InteractiveSimulator: ReLU.InteractiveSimulator },
  sigmoid: { info: Sigmoid.info, InteractiveSimulator: Sigmoid.InteractiveSimulator },
  tanh: { info: Tanh.info, InteractiveSimulator: Tanh.InteractiveSimulator },
  leaky_relu: { info: LeakyReLU.info, InteractiveSimulator: LeakyReLU.InteractiveSimulator },
  elu: { info: ELU.info, InteractiveSimulator: ELU.InteractiveSimulator },
  gelu: { info: GELU.info, InteractiveSimulator: GELU.InteractiveSimulator },
  maxpool2d: { info: MaxPool2D.info, InteractiveSimulator: MaxPool2D.InteractiveSimulator },
  maxpool3d: { info: MaxPool3D.info, InteractiveSimulator: MaxPool3D.InteractiveSimulator },
  linear: { info: Linear.info, InteractiveSimulator: Linear.InteractiveSimulator },
  flatten: { info: Flatten.info, InteractiveSimulator: Flatten.InteractiveSimulator },
  dropout: { info: Dropout.info, InteractiveSimulator: Dropout.InteractiveSimulator },
  batchnorm2d: { info: BatchNorm2D.info, InteractiveSimulator: BatchNorm2D.InteractiveSimulator },
  batchnorm3d: { info: BatchNorm3D.info, InteractiveSimulator: BatchNorm3D.InteractiveSimulator }
};
