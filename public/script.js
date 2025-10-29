// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const itemsContainer = document.getElementById("itemsContainer");
  const modal = document.getElementById("modal");
  const modalContent = document.querySelector(".modal-content");
  const closeModalBtn = document.getElementById("closeModal");

  // ✅ 1. Submit new item
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);

      try {
        const response = await fetch("http://localhost:5000/api/items", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          alert("✅ Item uploaded successfully!");
          form.reset();
          loadItems(); // refresh the list
        } else {
          alert("❌ Failed to upload item.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("⚠️ Something went wrong while uploading.");
      }
    });
  }

  // ✅ 2. Fetch and display all items
  async function loadItems() {
    try {
      const res = await fetch("http://localhost:5000/api/items");
      const data = await res.json();

      itemsContainer.innerHTML = "";

      if (data.length === 0) {
        itemsContainer.innerHTML = `<p>No items found yet.</p>`;
        return;
      }

      data.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("item-card");

        card.innerHTML = `
          <img src="/uploads/${item.itemPhoto}" alt="${item.itemName}" class="item-photo" />
          <h3>${item.itemName}</h3>
          <p>${item.itemDescription}</p>
          <p><strong>Category:</strong> ${item.itemCategory}</p>
          <p><strong>Location:</strong> ${item.itemLocation}</p>
          <button class="contact-btn" data-contact="${item.contactInfo}">Contact Finder</button>
        `;

        itemsContainer.appendChild(card);
      });

      // Attach event listeners to contact buttons
      document.querySelectorAll(".contact-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const contact = e.target.getAttribute("data-contact");
          showModal(contact);
        });
      });

    } catch (err) {
      console.error("Error loading items:", err);
    }
  }

  // ✅ 3. Modal handling
  function showModal(contact) {
    modalContent.querySelector("p").textContent = contact;
    modal.style.display = "block";
  }

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Load items on page start
  loadItems();
});
