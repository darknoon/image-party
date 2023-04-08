import { NextApiRequest, NextApiResponse } from "next"
import { Configuration, CreateImageRequest, OpenAIApi } from "openai"
import { z } from "zod"

export const CreatePartyImageRequest = z.object({
  keywords: z.array(z.string()),
})

export const CreatePartyImageResponse = z.object({
  images: z.array(z.string()),
})

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
})
const openai = new OpenAIApi(configuration)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { keywords } = CreatePartyImageRequest.parse(req.body)

    // Create a new image using the OpenAI API
    const createImageRequest: CreateImageRequest = {
      prompt: keywords.join(", "),
      n: 4,
    }

    const data = await openai.createImage(createImageRequest)

    res.status(200).json(data)
  } catch {
    res.status(500).json({ error: "Internal Server Error" })
  }
}
