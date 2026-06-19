import { NextRequest, NextResponse } from 'next/server'
import { ClickUpService } from '@/services/clickup/clickup.service'
import { env } from '@/lib/config/env'
import type { DeliveryPlanOutput, ArtifactGenerationOutput } from '@/types/claude'

interface PublishPayload {
  listId?: string
  demandTitle: string
  userStory: ArtifactGenerationOutput['userStory']
  deliveryPlan: DeliveryPlanOutput
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PublishPayload
    const { listId, demandTitle, userStory, deliveryPlan } = body

    const targetListId = listId ?? env.clickup.defaultListId
    if (!targetListId) {
      return NextResponse.json({ error: 'listId is required' }, { status: 400 })
    }

    const service = new ClickUpService()

    const mainTask = await service.createTask(targetListId, {
      name: deliveryPlan.mainTask.title,
      markdown_description: buildTaskDescription(userStory, deliveryPlan),
      tags: ['decision-intelligence', 'generated'],
    })

    const allSubtasks = [
      ...deliveryPlan.subtasks.backend,
      ...deliveryPlan.subtasks.frontend,
      ...deliveryPlan.subtasks.qa,
      ...deliveryPlan.subtasks.product,
      ...deliveryPlan.subtasks.devops,
    ]

    const createdSubtasks = await Promise.all(
      allSubtasks.map((subtask) =>
        service.createSubtask(mainTask.id, targetListId, {
          name: `[${subtask.assignTo.toUpperCase()}] ${subtask.title}`,
          description: subtask.description,
          priority: subtaskPriorityMap[subtask.priority],
          tags: ['decision-intelligence', subtask.assignTo],
        })
      )
    )

    await service.addTaskComment(
      mainTask.id,
      `Task gerada automaticamente pelo Decision Intelligence.\n\nDemanda original: ${demandTitle}`
    )

    return NextResponse.json({
      mainTask,
      subtasks: createdSubtasks,
      taskUrl: mainTask.url,
    })
  } catch (error) {
    console.error('[clickup/publish]', error)
    return NextResponse.json({ error: 'Failed to publish to ClickUp' }, { status: 500 })
  }
}

const subtaskPriorityMap: Record<string, 1 | 2 | 3 | 4> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
}

function buildTaskDescription(
  userStory: ArtifactGenerationOutput['userStory'],
  deliveryPlan: DeliveryPlanOutput
): string {
  return `## User Story
**Como** ${userStory.asA}, **eu quero** ${userStory.iWant} **para que** ${userStory.soThat}.

## Critérios de Aceite
${userStory.acceptanceCriteria.map((c) => `- ${c}`).join('\n')}

## Epic
${deliveryPlan.epic.title} — estimativa: ${deliveryPlan.epic.estimateDays} dias

## Estimativa Total
${deliveryPlan.totalEstimateHours}h

## Caminho Crítico
${deliveryPlan.criticalPath.map((c) => `1. ${c}`).join('\n')}

---
*Gerado pelo Decision Intelligence*`
}
