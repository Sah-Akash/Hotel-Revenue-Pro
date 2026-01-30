
import { db, admin } from '../utils/firebaseAdmin.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // 1. Verify Signature
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== req.headers['x-razorpay-signature']) {
      return res.status(400).json({ status: 'failure', message: 'Invalid signature' });
  }

  const event = req.body;

  try {
      if (event.event === 'payment.captured') {
          const { email, contact } = event.payload.payment.entity;
          const notes = event.payload.payment.entity.notes || {};
          const planType = notes.plan || 'pro_monthly';

          // 2. Find User by Email
          let userRecord;
          try {
              userRecord = await admin.auth().getUserByEmail(email);
          } catch (e) {
              console.log("User not found for payment, creating placeholder?");
              // In a real app, you might create a user or log an error
              return res.status(200).json({ status: 'ignored', reason: 'user_not_found' });
          }

          // 3. Create License
          const now = Date.now();
          const duration = planType === 'pro_yearly' ? 365 : 30;
          const expiresAt = now + (duration * 24 * 60 * 60 * 1000);

          await db.collection('licenses').doc(userRecord.uid).set({
              userId: userRecord.uid,
              planId: planType,
              status: 'active',
              startedAt: now,
              expiresAt: expiresAt,
              deviceId: null, // Allow new binding
              isRevoked: false,
              paymentId: event.payload.payment.entity.id
          }, { merge: true });

          await db.collection('licenseLogs').add({
              userId: userRecord.uid,
              event: 'payment_success',
              amount: event.payload.payment.entity.amount,
              timestamp: now
          });
      }

      res.status(200).json({ status: 'ok' });

  } catch (error) {
      console.error("Webhook Error", error);
      res.status(500).json({ status: 'error' });
  }
}
