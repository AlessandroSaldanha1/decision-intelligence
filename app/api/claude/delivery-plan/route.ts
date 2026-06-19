import { NextRequest, NextResponse } from 'next/server'
import { DeliveryPlanService } from '@/services/claude/delivery-plan.service'
import { KnowledgeService } from '@/services/knowledge/knowledge.service'
import type { DeliveryPlanInput } from '@/types/claude'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Omit<DeliveryPlanInput, 'organizationalContext'>

    const knowledgeService = new KnowledgeService()
    const orgContext = await knowledgeService.buildOrganizationalContext(body.demand)
    const organizationalContext = knowledgeService.formatContextForClaude(orgContext)

    const deliveryPlanService = new DeliveryPlanService()
    const deliveryPlan = await deliveryPlanService.generate({ ...body, organizationalContext })

    return NextResponse.json({ deliveryPlan })
  } catch (error) {
    console.error('[claude/delivery-plan]', error)
    return NextResponse.json({ error: 'Failed to generate delivery plan' }, { status: 500 })
  }
}
