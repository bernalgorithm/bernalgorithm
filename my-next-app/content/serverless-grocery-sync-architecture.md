---
title: 'Lab Notebook: Offline-First State & Multi-Tenant Sync in a Family Grocery PWA'
date: '2026-10-12'
description: 'Architecting zero-friction partner synchronization using collision-resistant pairing codes, subcollection item isolation, and offline-first state reconciliation with Firebase Firestore.'
tags: ['Distributed Systems', 'Offline-First', 'Firebase', 'TypeScript', 'React']
---

When designing a real-time collaborative shopping app (`groceryList`), the core engineering problem mirrors distributed telemetry in intermittent-connectivity IoT nodes: **two clients in a supermarket aisle with spotty cellular reception must check off items concurrently without clobbering each other's state or blocking the UI thread.**

Here is the architectural breakdown of how we designed and hardened the multi-tenant synchronization layer.

---

## 1. Zero-Friction "Model A" Family Pairing Codes

Traditional account creation and OAuth flows introduce high onboarding friction when two partners simply want to share a household grocery list. Instead, we implemented a hardware-style **Pairing Code** handshake:

* **Entropy & Readability**: Using a 30-character unambiguous alphabet (`23456789ABCDEFGHJKMNPQRSTUVWXYZ`, omitting `0/O` and `1/I/L`), a 6-character code (`XXX-XXX`) yields $30^6 = 729,000,000$ unique combinations.
* **Collision Verification**: Before provisioning a `familyRooms/{roomCode}` document, the client performs an atomic existence check and retries on collision before binding the caller's anonymous UID as `ownerId`.

```ts
export const generateCollisionResistantFamilyCode = (): string => {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let p1 = '', p2 = '';
  for (let i = 0; i < 3; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${p1}-${p2}`;
};
```

---

## 2. Preventing Write Clobbering via Subcollection Isolation

In an early iteration, storing all grocery items as a monolithic JSON array inside a single `lists/{listId}` document meant that two users checking off different items within the same RTT window could overwrite each other's array state.

### The Fix: Granular Item Subcollections
We refactored the data model so that list metadata resides at `lists/{listId}` while individual items live in `lists/{listId}/items/{itemId}`:

1. **Atomic Item Mutations**: Toggling `checked: true` on "Organic Milk" dispatches a single-document update to `lists/{listId}/items/{itemId}`, leaving concurrent edits on other items untouched.
2. **Bandwidth Reduction**: Snapshot listeners (`onSnapshot`) transmit only the delta for the modified item rather than re-serializing the entire list payload.

---

## 3. Multi-Tenant Security Rules (`firestore.rules`)

Even with anonymous authentication, multi-tenant isolation must be enforced at the database boundary rather than relying on client-side filtering:

* **Room Membership**: Only authenticated members present in `resource.data.memberIds` (or joining via a valid room code) can read or mutate shared lists.
* **Subcollection Inheritance**: Access to `lists/{listId}/items/{itemId}` validates membership against the parent list document.

```text
match /lists/{listId} {
  allow read: if isListMember(resource.data);
  allow update: if isListMember(resource.data) || isListMember(request.resource.data);

  match /items/{itemId} {
    allow read, write: if isAuthenticated() && (
      isListMember(get(/databases/$(database)/documents/lists/$(listId)).data)
    );
  }
}
```

---

## 4. Offline-First LocalStorage + Cloud Reconciliation

Just like an embedded device buffering sensor readings in local flash when the radio link drops, `AppContext` persists every mutation immediately to `localStorage` and optimistically updates React state. When Firebase connectivity is present (or restored), `cloudSync.ts` reconciles local lists with `onSnapshot` streams without losing offline edits.
