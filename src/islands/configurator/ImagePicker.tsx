'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { type DragEvent, useState } from 'react'
import type { ImageAsset } from '@/content/images/types.ts'
import {
  MAX_UPLOAD_BYTES,
  type UploadError,
  UPLOAD_TYPES,
} from '@/features/configurator/model/upload.ts'
import { presetImage } from '@/features/configurator/start.ts'
import type { PrintImage } from '@/features/configurator/store.ts'
import { prepareUpload } from './prepare-upload.ts'
import { useConfigurator } from './store-context.tsx'

// Control 3 (Development Plan 4.7): a ready image, or the visitor's own.

export interface PresetOption {
  id: string
  title: string
  image: ImageAsset
}

const MB = 1024 * 1024

export function ImagePicker({
  presets,
  presetsAreExamples,
  contactEmail,
}: {
  presets: readonly PresetOption[]
  presetsAreExamples: boolean
  contactEmail: string
}) {
  const t = useTranslations('Configurator.image')
  const image = useConfigurator((state) => state.image)
  const chooseImage = useConfigurator((state) => state.chooseImage)
  // A new image frees the local URL of an earlier upload.
  const replaceImage = (next: PrintImage) => {
    if (image.kind === 'upload') URL.revokeObjectURL(image.src)
    chooseImage(next)
  }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ code: UploadError; sizeMb: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const upload = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    const result = await prepareUpload(file)
    setBusy(false)
    if (result.error) setError({ code: result.error, sizeMb: Math.ceil(file.size / MB) })
    else replaceImage(result.image)
  }

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    void upload(event.dataTransfer.files[0])
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-xs font-medium text-mute">
          {t('presets')}
          {presetsAreExamples && (
            <span className="ml-2 rounded-full bg-plaster px-2 py-0.5 text-[0.7rem] font-medium">
              {t('example')}
            </span>
          )}
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <label
              key={preset.id}
              className="group cursor-pointer rounded-xl p-1 ring-1 ring-graphite/10 transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-plaster active:scale-[0.98] has-checked:ring-2 has-checked:ring-magenta has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-graphite motion-reduce:active:scale-100"
            >
              <input
                type="radio"
                name="preset"
                checked={image.kind === 'preset' && image.id === preset.id}
                onChange={() => replaceImage(presetImage(preset))}
                className="sr-only"
              />
              <span className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-plaster">
                <Image
                  src={preset.image.src}
                  alt=""
                  fill
                  sizes="120px"
                  placeholder="blur"
                  blurDataURL={preset.image.blurDataURL}
                  className="object-cover"
                />
              </span>
              <span className="mt-1 block truncate px-0.5 text-xs">{preset.title}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        {/* Dropping a file is an extra for mouse users; the file input inside is the control. */}
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <label
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-graphite ${
            image.kind === 'upload'
              ? 'border-graphite bg-plaster'
              : dragging
                ? 'border-graphite bg-plaster'
                : 'border-graphite/20 hover:border-graphite/50'
          }`}
        >
          <input
            type="file"
            accept={UPLOAD_TYPES.join(',')}
            disabled={busy}
            onChange={(event) => {
              void upload(event.target.files?.[0])
              // Lets the visitor choose the same file again.
              event.target.value = ''
            }}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-graphite text-lime"
          >
            ↑
          </span>
          <span className="min-w-0">
            {busy ? t('opening') : t('upload')}
            {image.kind === 'upload' && !busy && (
              <span className="block truncate text-xs font-normal text-mute">
                {t('uploaded', { name: image.name })}
              </span>
            )}
          </span>
        </label>

        {error && (
          <p
            role="alert"
            className="mt-2 rounded-xl bg-magenta/5 px-3 py-2 text-xs leading-relaxed text-magenta-700"
          >
            {t(`errors.${error.code}`, {
              size: error.sizeMb,
              max: MAX_UPLOAD_BYTES / MB,
              email: contactEmail,
            })}
          </p>
        )}
        <p className="mt-2 text-xs leading-relaxed text-mute">
          {t('uploadHint', { max: MAX_UPLOAD_BYTES / MB })}
        </p>
      </div>
    </div>
  )
}
