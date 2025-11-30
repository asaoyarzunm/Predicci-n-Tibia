
import { PredictionResult } from '../types';
import * as tf from '@tensorflow/tfjs';

/**
 * ==========================================
 * CONFIGURACIÓN DE CLASES DEL MODELO
 * ==========================================
 * Rango: 240mm a 480mm (Múltiplos de 15mm)
 * Total: 17 clases (0 a 16)
 */
const MODEL_CLASSES_MAPPING = [
  { d: null, l: 240 }, // Class 0
  { d: null, l: 255 }, // Class 1
  { d: null, l: 270 }, // Class 2
  { d: null, l: 285 }, // Class 3
  { d: null, l: 300 }, // Class 4
  { d: null, l: 315 }, // Class 5
  { d: null, l: 330 }, // Class 6 (Target para 175cm)
  { d: null, l: 345 }, // Class 7
  { d: null, l: 360 }, // Class 8
  { d: null, l: 375 }, // Class 9
  { d: null, l: 390 }, // Class 10
  { d: null, l: 405 }, // Class 11
  { d: null, l: 420 }, // Class 12
  { d: null, l: 435 }, // Class 13
  { d: null, l: 450 }, // Class 14
  { d: null, l: 465 }, // Class 15
  { d: null, l: 480 }, // Class 16
];

// ARQUITECTURA DEL MODELO
const MODEL_ARCHITECTURE_JSON = {
  "format": "layers-model",
  "generatedBy": "keras v3.10.0",
  "convertedBy": "TensorFlow.js Converter v4.22.0",
  "modelTopology": {
    "keras_version": "3.10.0",
    "backend": "tensorflow",
    "model_config": {
      "class_name": "Sequential",
      "config": {
        "name": "sequential",
        "trainable": true,
        "dtype": { "module": "keras", "class_name": "DTypePolicy", "config": { "name": "float32" }, "registered_name": null },
        "layers": [
          { "class_name": "InputLayer", "config": { "batch_shape": [null, 1], "dtype": "float32", "sparse": false, "ragged": false, "name": "input_layer" } },
          { "class_name": "Dense", "config": { "name": "dense", "trainable": true, "dtype": { "module": "keras", "class_name": "DTypePolicy", "config": { "name": "float32" }, "registered_name": null }, "units": 10, "activation": "relu", "use_bias": true, "kernel_initializer": { "module": "keras.initializers", "class_name": "GlorotUniform", "config": { "seed": null }, "registered_name": null }, "bias_initializer": { "module": "keras.initializers", "class_name": "Zeros", "config": {}, "registered_name": null } } },
          { "class_name": "Dense", "config": { "name": "dense_1", "trainable": true, "dtype": { "module": "keras", "class_name": "DTypePolicy", "config": { "name": "float32" }, "registered_name": null }, "units": 10, "activation": "relu", "use_bias": true, "kernel_initializer": { "module": "keras.initializers", "class_name": "GlorotUniform", "config": { "seed": null }, "registered_name": null }, "bias_initializer": { "module": "keras.initializers", "class_name": "Zeros", "config": {}, "registered_name": null } } },
          { "class_name": "Dense", "config": { "name": "dense_2", "trainable": true, "dtype": { "module": "keras", "class_name": "DTypePolicy", "config": { "name": "float32" }, "registered_name": null }, "units": 10, "activation": "relu", "use_bias": true, "kernel_initializer": { "module": "keras.initializers", "class_name": "GlorotUniform", "config": { "seed": null }, "registered_name": null }, "bias_initializer": { "module": "keras.initializers", "class_name": "Zeros", "config": {}, "registered_name": null } } },
          { "class_name": "Dense", "config": { "name": "dense_3", "trainable": true, "dtype": { "module": "keras", "class_name": "DTypePolicy", "config": { "name": "float32" }, "registered_name": null }, "units": 17, "activation": "softmax", "use_bias": true, "kernel_initializer": { "module": "keras.initializers", "class_name": "GlorotUniform", "config": { "seed": null }, "registered_name": null }, "bias_initializer": { "module": "keras.initializers", "class_name": "Zeros", "config": {}, "registered_name": null } } }
        ],
        "build_input_shape": [null, 1]
      }
    },
    "training_config": {
      "loss": "categorical_crossentropy",
      "metrics": ["accuracy"],
      "optimizer_config": {
        "class_name": "Adam",
        "config": { "name": "adam", "learning_rate": 0.001 }
      }
    }
  },
  "weightsManifest": [
    {
      "paths": ["group1-shard1of1.bin"],
      "weights": [
        { "name": "sequential/dense/kernel", "shape": [1, 10], "dtype": "float32" },
        { "name": "sequential/dense/bias", "shape": [10], "dtype": "float32" },
        { "name": "sequential/dense_1/kernel", "shape": [10, 10], "dtype": "float32" },
        { "name": "sequential/dense_1/bias", "shape": [10], "dtype": "float32" },
        { "name": "sequential/dense_2/kernel", "shape": [10, 10], "dtype": "float32" },
        { "name": "sequential/dense_2/bias", "shape": [10], "dtype": "float32" },
        { "name": "sequential/dense_3/kernel", "shape": [10, 17], "dtype": "float32" },
        { "name": "sequential/dense_3/bias", "shape": [17], "dtype": "float32" }
      ]
    }
  ]
};

let realModel: tf.LayersModel | null = null;
let isModelLoaded = false;
const DB_PATH = 'indexeddb://ortho-predict-model';

/**
 * 1. Intenta cargar desde la memoria del navegador (IndexedDB)
 */
export const loadModelFromCache = async (): Promise<boolean> => {
  try {
    realModel = await tf.loadLayersModel(DB_PATH);
    isModelLoaded = true;
    console.log("Modelo cargado desde caché (IndexedDB)");
    return true;
  } catch (e) {
    // Es normal fallar si es la primera vez
    return false;
  }
};

/**
 * 2. Intenta cargar desde el servidor (archivos locales)
 */
export const loadModelFromServer = async (): Promise<boolean> => {
  try {
    realModel = await tf.loadLayersModel('./model.json');
    isModelLoaded = true;
    console.log("Modelo IA cargado desde servidor");
    // Guardar en caché para la próxima
    await realModel.save(DB_PATH);
    return true;
  } catch (error) {
    console.warn("No se encontró el modelo en el servidor.");
    return false;
  }
};

/**
 * 3. Carga manual y guardado persistente
 */
export const loadModelFromUserFile = async (binFile: File): Promise<boolean> => {
  try {
    const jsonFile = new File(
      [JSON.stringify(MODEL_ARCHITECTURE_JSON)], 
      'model.json', 
      { type: 'application/json' }
    );

    realModel = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, binFile]));
    isModelLoaded = true;
    
    // GUARDAR EN MEMORIA DEL NAVEGADOR
    await realModel.save(DB_PATH);
    console.log("Modelo IA cargado y guardado en memoria.");
    
    return true;
  } catch (error) {
    console.error("Error cargando modelo manual:", error);
    isModelLoaded = false;
    return false;
  }
};

const getResultType = (rank: number): string => {
  if (rank === 0) return "Opción Recomendada";
  if (rank === 1) return "Alternativa 1";
  return "Alternativa 2";
};

const runSimulation = (heightCm: number): PredictionResult[] => {
  // Ajuste calibrado: 175cm -> ~330mm
  const estimatedRawMm = heightCm * 1.89; 
  const standardLength = Math.round(estimatedRawMm / 15) * 15; 
  const clampedLength = Math.max(240, Math.min(480, standardLength));

  return [
    { rank: 1, diameter: null, length: clampedLength, confidence: 92.5, type: "Simulación (Estándar)" },
    { rank: 2, diameter: null, length: clampedLength - 15, confidence: 85.0, type: "Simulación (Corto)" },
    { rank: 3, diameter: null, length: clampedLength + 15, confidence: 72.0, type: "Simulación (Largo)" }
  ];
};

export const predictNailSize = async (heightCm: number): Promise<PredictionResult[]> => {
  if (realModel && isModelLoaded) {
    try {
      const inputTensor = tf.tensor2d([heightCm], [1, 1]);
      const prediction = realModel.predict(inputTensor) as tf.Tensor;
      const values = await prediction.data();
      
      const indexedValues = Array.from(values).map((value, index) => ({ value: Number(value), index }));
      indexedValues.sort((a, b) => b.value - a.value);
      const top3 = indexedValues.slice(0, 3);

      inputTensor.dispose();
      prediction.dispose();

      const results: PredictionResult[] = top3.map((item, i) => {
        const sizeClass = MODEL_CLASSES_MAPPING[item.index] || { d: null, l: 0 };
        return {
          rank: i + 1,
          diameter: sizeClass.d,
          length: sizeClass.l,
          confidence: parseFloat((item.value * 100).toFixed(1)),
          type: getResultType(i)
        };
      });

      return results;

    } catch (error) {
      console.error("Error ejecutando modelo:", error);
      return runSimulation(heightCm);
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(runSimulation(heightCm));
    }, 400);
  });
};
