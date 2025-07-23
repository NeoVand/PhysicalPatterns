/// <reference types="@webgpu/types" />

declare global {
  interface Navigator {
    gpu: GPU | undefined;
  }
}

export {} 