import {
  WebhookEvent,
  WebhookRequestBody,
  middleware,
  Message,
  ClientConfig,
  messagingApi,
  MiddlewareConfig
} from '@line/bot-sdk'
import { db } from '@/utils/firebase-admin/initialize'
import admin from 'firebase-admin'

const lineConfig: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
}

const middlewareConfig: MiddlewareConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
}

const client = new messagingApi.MessagingApiClient(lineConfig)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: any, res: any) {
  try {
    await new Promise((resolve, reject) => {
      middleware(middlewareConfig)(req, res, (err) => {
        if (err) reject(err)
        resolve(undefined)
      })
    })

    const events: WebhookEvent[] = (req.body as WebhookRequestBody).events

    await Promise.all(
      events.map(async (event: WebhookEvent) => {
        switch (event.type) {
          case 'follow':
            await handleFollowEvent(event)
            break
          case 'accountLink':
            await handleAccountLinkEvent(event)
            break
          case 'postback':
            await handlePostbackEvent(event)
            break
          // 必要になったら、各イベントに対応する関数を追加する
          // case 'unfollow':
          //   break
          // case 'join':
          //   break
          // case 'leave':
          //   break
          // case 'message':
          //   break
          // case 'beacon':
          //   break
          // case 'memberJoined':
          //   break
          // case 'memberLeft':
          //   break
          // case 'things':
          //   break
          default:
            console.log(`未実装のevent type: ${ event.type }`, event)
        }
      })
    )

    res.status(200).end()
  } catch (error) {
    console.error(error)
    res.status(500).json()
  }
}

async function handleFollowEvent(event: WebhookEvent) {
  const lineUserId = event.source.userId

  if (!lineUserId) {
    console.error('event.source.userId(lineUserId) is undefined.')
    return
  }

  const linkToken = await issueLinkToken(lineUserId)
  const linkUrl = `${ process.env.NEXT_PUBLIC_DOMAIN }/link?linkToken=${ linkToken }`
  const message: Message = {
    type: 'template',
    altText: 'アカウント連携のご案内',
    template: {
      type: 'buttons',
      text: 'アカウントを連携してください。',
      actions: [
        {
          type: 'uri',
          label: '連携する',
          uri: linkUrl,
        },
      ],
    },
  }

  await client.pushMessage({
    to: lineUserId,
    messages: [message],
  })
  console.log(`Sent account link message to user: ${ lineUserId }`)

}

async function issueLinkToken(userId: string): Promise<string> {
  try {
    // 連携トークンは10分間有効で、1回のみ使用できる
    const response = await fetch(`https://api.line.me/v2/bot/user/${ userId }/linkToken`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ process.env.LINE_CHANNEL_ACCESS_TOKEN }`,
      },
    })
    const data = await response.json()
    return data.linkToken
  } catch (error) {
    console.error(`Error issuing link token: ${ error }`)
    throw error
  }
}

async function handleAccountLinkEvent(event: WebhookEvent) {
  if (event.type === 'accountLink') {
    const lineUserId = event.source.userId

    if (!lineUserId) {
      console.error('lineUserId is undefined.')
      return
    }

    const linkResult = event.link.result
    const nonce = event.link.nonce

    try {
      if (linkResult === 'ok') {
        console.log(`Account linked successfully for user: ${ lineUserId }`)

        // nonceからFirebase User IDを取得
        const firebaseUserId = await getFirebaseUserIdByNonce(nonce)

        if (firebaseUserId) {
          // FirebaseユーザーとLINEユーザーを紐付け
          await db
            .collection('users')
            .doc(firebaseUserId)
            .set(
              {
                lineUserId: lineUserId,
                linkedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            )

          console.log(`Firebase user ${ firebaseUserId } linked with LINE user ${ lineUserId }`)

          // ユーザーに連携完了のメッセージを送信
          const message: Message = { type: 'text', text: 'アカウントの連携が完了しました。' }
          await client.pushMessage({
            to: lineUserId,
            messages: [message],
          })
        }
      } else {
        console.log(`Account linking failed: ${ lineUserId }`)

        // 連携失敗のメッセージを送信
        const message: Message = { type: 'text', text: 'アカウント連携に失敗しました。再度お試しください。' }
        await client.pushMessage({
          to: lineUserId,
          messages: [message],
        })
      }
    } catch (error) {
      console.error(error)
    }
  }
}

async function getFirebaseUserIdByNonce(nonce: string): Promise<string | null> {
  try {
    const snapshot = await db
      .collection('account_link_nonces')
      .where('nonce', '==', nonce)
      .where('usedAt', '==', null)
      .limit(1)
      .get()

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      const data = doc.data()

      // nonceを使用済みにする
      await doc.ref.update({
        usedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      return data.firebaseUserId
    }

    return null
  } catch (error) {
    console.error(error)
    return null
  }
}

async function handlePostbackEvent(event: WebhookEvent) {
  if (event.type === 'postback') {
    const lineUserId = event.source.userId;
    const postbackData = event.postback.data;

    if (!lineUserId) {
      console.error('lineUserId is undefined.');
      return;
    }

    const params = new URLSearchParams(postbackData);
    const action = params.get('action');

    if (action === 'accountLink') {
      try {
        const linkToken = await issueLinkToken(lineUserId);
        const linkUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/line-link?linkToken=${linkToken}`;

        const message: Message = {
          type: 'template',
          altText: 'アカウント連携のご案内',
          template: {
            type: 'buttons',
            text: 'アカウントを連携してください。',
            actions: [
              {
                type: 'uri',
                label: '連携する',
                uri: linkUrl,
              },
            ],
          },
        };

        await client.pushMessage({
          to: lineUserId,
          messages: [message],
        });
        console.log(`Sent account link message to user: ${lineUserId}`);
      } catch (error) {
        console.error(`Error issuing link token: ${error}`);
      }
    } else {
      console.log(`Unknown action: ${action}`);
    }
  }
}
