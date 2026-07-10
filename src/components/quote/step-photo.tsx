"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { compressImage } from "@/lib/utils";

interface StepPhotoProps {
  onFileSelect: (file: File | null) => void;
  onBack: () => void;
  onNext: () => void;
  existingFile: File | null;
  existingUrl: string | null;
}

export function StepPhoto({
  onFileSelect,
  onBack,
  onNext,
  existingFile,
  existingUrl,
}: StepPhotoProps) {
  const [preview, setPreview] = useState<string | null>(
    existingUrl || (existingFile ? URL.createObjectURL(existingFile) : null)
  );
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Please select a JPEG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      const compressedFile = new File([compressed], file.name, {
        type: "image/jpeg",
      });
      setPreview(URL.createObjectURL(compressedFile));
      onFileSelect(compressedFile);
    } catch {
      alert("Failed to compress image. Using original.");
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    } finally {
      setCompressing(false);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-primary mb-1">
          Meter Photo
        </h3>
        <p className="text-sm text-gray-500">
          Take a photo of your current electricity meter. This helps us
          estimate your load requirements.
        </p>
      </div>

      <div
        className="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02]"
        style={{ borderColor: preview ? "var(--primary)" : undefined, backgroundColor: preview ? "var(--primary)" + "05" : undefined }}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative inline-block">
            <Image
              src={preview}
              alt="Meter preview"
              width={400}
              height={300}
              unoptimized
              className="max-h-48 w-auto rounded-lg object-contain shadow-sm"
            />
            <button
              onClick={(e) => { e.stopPropagation(); clearPhoto(); }}
              className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-danger text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Upload meter photo
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                JPEG or PNG, max 5MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
          className="hidden"
        />

        {!preview && (
          <div className="flex gap-3 mt-5 justify-center">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" />
              Upload
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-4 h-4" />
              Camera
            </Button>
          </div>
        )}
      </div>

      {compressing && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Spinner size="sm" />
          Compressing image...
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          {preview ? "Continue" : "Skip"}
        </Button>
      </div>
    </motion.div>
  );
}
