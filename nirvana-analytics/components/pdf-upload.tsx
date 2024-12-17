import { useState } from 'react'
import { Upload } from 'lucide-react'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'

interface PdfUploadProps {
  form: any
  onFileSelect: (file: File) => Promise<void>
}

export function PdfUpload({ form, onFileSelect }: PdfUploadProps) {
  const [fileName, setFileName] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  return (
    <FormField
      control={form.control}
      name="bloodReport"
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>Blood Report (PDF)</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isUploading}
                onClick={() => document.getElementById('pdf-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Processing...' : 'Upload PDF'}
              </Button>
              {fileName && (
                <span className="text-sm text-muted-foreground truncate">
                  {fileName}
                </span>
              )}
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setFileName(file.name)
                    setIsUploading(true)
                    try {
                      await onFileSelect(file)
                      onChange(file)
                    } finally {
                      setIsUploading(false)
                    }
                  }
                }}
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 