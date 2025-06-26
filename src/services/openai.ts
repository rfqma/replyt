import OpenAI from "openai";
import { AIResponse, YouTubeComment } from "../types";

export class OpenAIService {
  private openai: OpenAI;
  private replyStyle: string;

  constructor(apiKey: string, replyStyle: string = "friendly") {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.replyStyle = replyStyle;
  }

  async generateReply(
    comment: YouTubeComment,
    videoTitle?: string
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(comment, videoTitle);

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      return {
        content: content,
        reasoning: `Generated ${this.replyStyle} response for comment by ${comment.authorDisplayName}`,
      };
    } catch (error) {
      console.error("Error generating AI reply:", error);
      throw error;
    }
  }

  private buildSystemPrompt(): string {
    const basePrompt = `You are an AI assistant that helps YouTube content creators automatically reply to comments.

MAIN INSTRUCTIONS:
- Reply in the same language as the comment (Indonesian/English)
- Reply style: ${this.replyStyle}
- Maximum 2-3 sentences
- Always polite and professional
- Don't answer complex technical questions or provide medical/legal advice
- If comment is negative or spam, create short positive response
- Use emojis appropriately to look natural
- Never mention that you are an AI

RESPONSE TYPES BASED ON COMMENT:
- Praise/positive feedback: Say thank you and show appreciation
- Simple questions: Answer briefly or direct to video/description
- Constructive criticism: Accept feedback openly
- Spam/negative: Short positive response, no need to argue
- Simple emoji/reactions: Reply with brief appreciation

EXAMPLE REPLIES:
- "Thank you so much! Glad the video was helpful 😊"
- "Thanks for watching! Hope it helps 🙏"
- "Thanks for the feedback, will keep improving the content!"
- "Appreciate your support! 💪"`;

    return basePrompt;
  }

  private buildUserPrompt(
    comment: YouTubeComment,
    videoTitle?: string
  ): string {
    let prompt = `COMMENT TO REPLY TO:
From: ${comment.authorDisplayName}
Content: "${comment.textOriginal}"
Like count: ${comment.likeCount}`;

    if (videoTitle) {
      prompt += `\nVideo Title: "${videoTitle}"`;
    }

    if (comment.parentId) {
      prompt += `\n(This is a reply to another comment)`;
    }

    prompt += `\n\nGenerate appropriate reply:`;

    return prompt;
  }

  async shouldReplyToComment(comment: YouTubeComment): Promise<boolean> {
    // Skip replies to other comments (we only reply to top-level comments)
    if (comment.parentId) {
      return false;
    }

    // Skip very short comments that are likely just emoji/reactions
    if (comment.textOriginal.trim().length < 3) {
      return false;
    }

    // Skip if comment is too old (more than 7 days)
    const commentDate = new Date(comment.publishedAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (commentDate < weekAgo) {
      return false;
    }

    // Check for obvious spam patterns
    const spamPatterns = [
      /subscribe.*channel/i,
      /check.*out.*my/i,
      /follow.*me.*on/i,
      /👆👆👆/,
      /🔥🔥🔥.*subscribe/i,
    ];

    const isSpam = spamPatterns.some((pattern) =>
      pattern.test(comment.textOriginal)
    );
    if (isSpam) {
      return false;
    }

    return true;
  }
}
