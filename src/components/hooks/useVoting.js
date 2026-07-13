import { runTransaction, doc, collection } from "firebase/firestore";

export const castVote = async (electionId, userId, candidateId, position) => {
  const voteRef = doc(collection(db, "votes"), `${electionId}_${userId}_${position}`);
  const candidateRef = doc(db, "candidates", candidateId);
  const electionRef = doc(db, "elections", electionId);

  try {
    await runTransaction(db, async (transaction) => {
      const voteSnap = await transaction.get(voteRef);
      
      // 1. Check if user already voted for this specific position
      if (voteSnap.exists()) {
        throw "You have already cast your vote for this position.";
      }

      // 2. Record the vote
      transaction.set(voteRef, {
        electionId,
        userId,
        candidateId,
        position,
        timestamp: serverTimestamp()
      });

      // 3. Increment the candidate's personal tally
      transaction.update(candidateRef, {
        voteCount: increment(1)
      });

      // 4. Increment the election's total turnout
      transaction.update(electionRef, {
        totalTurnout: increment(1)
      });
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: e };
  }
};