const form = document.getElementById("itemForm");
const itemsContainer = document.getElementById("itemsContainer");

async function loadItems() {
  const res = await fetch("/api/items");
  const items = await res.json();
  itemsContainer.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p><strong>Location:</strong> ${item.location}</p>
      <p><strong>Date:</strong> ${item.date}</p>
      <p><strong>Type:</strong> ${item.type}</p>
      <p><strong>Contact:</strong> ${item.contact}</p>
    `;
    itemsContainer.appendChild(card);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newItem = {
    name: form.name.value,
    description: form.description.value,
    location: form.location.value,
    date: form.date.value,
    type: form.type.value,
    contact: form.contact.value,
  };

  await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newItem),
  });

  form.reset();
  loadItems();
});

loadItems();
