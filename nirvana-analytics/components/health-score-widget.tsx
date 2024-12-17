import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface HealthScoreWidgetProps {
  title: string
  score: number
  explanation: string
}

export function HealthScoreWidget({ title, score, explanation }: HealthScoreWidgetProps) {
  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-500'
    if (score >= 4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="p-6 border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{explanation}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="space-y-2">
        {/* Score display */}
        <div className="text-2xl font-bold">
          {score.toFixed(1)}/10
        </div>
        
        {/* Score bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              getScoreColor(score)
            )}
            style={{ width: `${score * 10}%` }}
          />
        </div>
      </div>
    </div>
  )
} 