export function renderAdSlot(container, type = 'banner', id = 'ad') {
  const slot = document.createElement('div');
  slot.className = `ad-slot ad-slot-${type}`;
  slot.id = `ad-${id}`;
  // This is where ad network code will be inserted.
  // For now, show a subtle placeholder that's easy to replace.
  slot.innerHTML = `<!-- Ad Slot: ${id} (${type}) — Replace with ad network code -->`;
  container.appendChild(slot);
  return slot;
}
