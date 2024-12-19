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
  scoringSystem: 'systemA' | 'systemB'
  explanation: string
}

export function HealthScoreWidget({ 
  title, 
  score, 
  scoringSystem,
  explanation 
}: HealthScoreWidgetProps) {
  // Get color based on score and scoring system
  const getScoreColor = (score: number, system: 'systemA' | 'systemB') => {
    if (system === 'systemA') {
      // SystemA: 0 is worst, 10 is best
      if (score >= 7) return 'bg-green-500'
      if (score >= 4) return 'bg-yellow-500'
      return 'bg-red-500'
    } else {
      // SystemB: 0 is best, 10 is worst
      if (score <= 3) return 'bg-green-500'
      if (score <= 6) return 'bg-yellow-500'
      return 'bg-red-500'
    }
  }

  // Get score text based on scoring system
  const getScoreText = (score: number, system: 'systemA' | 'systemB') => {
    if (system === 'systemA') {
      if (score >= 7) return 'Good'
      if (score >= 4) return 'Moderate'
      return 'Poor'
    } else {
      if (score <= 3) return 'Low Risk'
      if (score <= 6) return 'Moderate Risk'
      return 'High Risk'
    }
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
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {score.toFixed(1)}/10
          </div>
          <div className={cn(
            "px-2 py-1 rounded text-sm font-medium",
            getScoreColor(score, scoringSystem).replace('bg-', 'text-')
          )}>
            {getScoreText(score, scoringSystem)}
          </div>
        </div>
        
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              getScoreColor(score, scoringSystem)
            )}
            style={{ 
              width: `${score * 10}%` 
            }}
          />
        </div>
      </div>
    </div>
  )
} 