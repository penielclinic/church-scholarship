import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt) return NextResponse.json({ error: '프롬프트가 없습니다.' }, { status: 400 })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system:
        '당신은 교회 장학위원회 행정 감사 전문가입니다. 장학금 신청 자격, 심사 절차, 지급 관리, 사후 관리 데이터를 분석하여 이상 징후와 개선사항을 명확히 제시합니다. 해운대순복음교회의 6개 장학금(바나바, 빌립, 다비다/데보라, 다니엘, 여호수아, 특별)을 기준으로 분석합니다. 항상 한국어로 답변하세요.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0]?.type === 'text' ? message.content[0].text : '결과를 가져오지 못했습니다.'
    return NextResponse.json({ text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
