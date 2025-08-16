import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuração do Supabase
const supabaseUrl = "https://wthcwllhzbahvnnjqlko.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aGN3bGxoemJhaHZubmpxbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTk5NjMsImV4cCI6MjA3MDA5NTk2M30.7uzMcp8NsyxYuMmN7nnbBB0dJITJ_C7O7Ck0HFQgbOA";
const supabase = createClient(supabaseUrl, supabaseKey);

// Elementos do DOM
const form = document.getElementById("car-form");
const list = document.getElementById("vehicle-list");
const cancelBtn = document.getElementById("cancel-edit");
const galleryUrlsInput = document.getElementById("gallery_urls");
const previewContainer = document.getElementById("preview-container");
const uploadWidgetBtn = document.getElementById("upload-widget");
const coverImageUrlInput = document.getElementById("cover_image_url");
const uploadCoverBtn = document.getElementById("upload-cover-btn");
const coverPreview = document.getElementById("cover-preview");

// Variáveis de estado
let editId = null;
let imageUrls = [];

// Configuração do Cloudinary
const myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "du53gt50t",
    uploadPreset: "ml_default",
    multiple: true,
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      addImageUrl(result.info.secure_url);
    } else if (error) {
      console.error("Erro no Cloudinary:", error);
    }
  }
);

// Função para adicionar imagens ao preview
function addImageUrl(url) {
  if (imageUrls.includes(url)) {
    console.warn("Esta imagem já foi adicionada");
    return; // Este return está dentro de uma função, portanto é válido
  }

  imageUrls.push(url);
  updateImagePreviews();
  updateGalleryInput();
}

function updateImagePreviews() {
  previewContainer.innerHTML = "";

  imageUrls.forEach((url, index) => {
    const imgWrapper = document.createElement("div");
    imgWrapper.style.position = "relative";
    imgWrapper.style.display = "inline-block";
    imgWrapper.style.margin = "5px";

    const img = document.createElement("img");
    img.src = url;
    img.style.width = "100px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "4px";
    img.style.border = "1px solid #ddd";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.style.position = "absolute";
    removeBtn.style.top = "-5px";
    removeBtn.style.right = "-5px";
    removeBtn.style.background = "#ff4444";
    removeBtn.style.color = "white";
    removeBtn.style.border = "none";
    removeBtn.style.borderRadius = "50%";
    removeBtn.style.width = "20px";
    removeBtn.style.height = "20px";
    removeBtn.style.cursor = "pointer";
    removeBtn.onclick = () => removeImage(index);

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(removeBtn);
    previewContainer.appendChild(imgWrapper);
  });
}

function removeImage(index) {
  imageUrls.splice(index, 1);
  updateImagePreviews();
  updateGalleryInput();
}

function updateGalleryInput() {
  galleryUrlsInput.value = imageUrls.join(", ");
}

function resetForm() {
  editId = null;
  form.reset();
  imageUrls = [];
  previewContainer.innerHTML = "";
  galleryUrlsInput.value = "";
  form.querySelector('button[type="submit"]').textContent = "Salvar";
  cancelBtn.style.display = "none";
  coverImageUrlInput.value = "";
  coverPreview.innerHTML = "";
}

// Event Listeners
uploadWidgetBtn.addEventListener("click", () => {
  myWidget.open();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isFeaturedChecked = document.getElementById("is_featured").checked;
  const isActiveChecked = document.getElementById("is_active").checked;

  // Verificar limite de destaques
  if (isFeaturedChecked) {
    const featuredCount = await checkFeaturedLimit();

    // Se estiver editando um veículo que já é destaque, não conta como novo
    const isEditingFeatured =
      editId &&
      document.getElementById("is_featured").hasAttribute("data-was-featured");

    if (!isEditingFeatured && featuredCount >= 3) {
      alert(
        "Já existem 3 veículos em destaque. Remova o destaque de outro veículo antes."
      );
      return;
    }
  }

  const carData = {
    title: form.title.value.trim(),
    short_description: form.short_description.value.trim(),
    year: Number(form.year.value),
    price: Number(form.price.value),
    cover_image_url: form.cover_image_url.value.trim(),
    gallery_urls: imageUrls.length > 0 ? imageUrls : null,
    category: form.category.value,
    vehicle_type: form.vehicle_type.value,
    is_featured: isFeaturedChecked,
    is_active: isActiveChecked,
  };

  // Validação
  if (!carData.title || isNaN(carData.year)) {
    alert("Preencha os campos obrigatórios corretamente");
    return; // Este return está dentro de uma função, portanto é válido
  }

  async function checkFeaturedLimit() {
    const { count } = await supabase
      .from("cars")
      .select("*", { count: "exact" })
      .eq("is_featured", true);

    return count;
  }

  try {
    if (editId) {
      const { error } = await supabase
        .from("cars")
        .update(carData)
        .eq("id", editId);

      if (error) throw error;
      alert("Veículo atualizado com sucesso!");
    } else {
      const { error } = await supabase.from("cars").insert([carData]);
      if (error) throw error;
      alert("Veículo cadastrado com sucesso!");
    }

    resetForm();
    await loadVehicles();
  } catch (error) {
    console.error("Erro completo:", error);
    alert("Erro ao salvar: " + error.message);
  }
});

cancelBtn.addEventListener("click", resetForm);

// Funções para a listagem
async function loadVehicles() {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    list.innerHTML = "";

    data.forEach((vehicle) => {
      const item = document.createElement("li");
      item.className = `vehicle-item ${vehicle.is_active ? "" : "sold"}`;
      item.dataset.id = vehicle.id; // Adiciona data-id para referência

      item.innerHTML = `
        <div class="vehicle-content">
          <div class="vehicle-info">
            <h3>${vehicle.title}</h3>
            <p>Ano: ${
              vehicle.year
            } | Preço: R$${vehicle.price.toLocaleString()}</p>
            ${
              vehicle.is_featured
                ? '<span class="featured-badge">★ Destaque</span>'
                : ""
            }
          </div>
          <div class="vehicle-image-container">
            ${
              vehicle.cover_image_url
                ? `
              <img src="${vehicle.cover_image_url}" alt="${
                    vehicle.title
                  }" class="vehicle-thumbnail">
              ${
                !vehicle.is_active
                  ? '<div class="sold-banner">VENDIDO</div>'
                  : ""
              }
            `
                : ""
            }
          </div>
          <div class="vehicle-actions">
            <button onclick="editVehicle('${vehicle.id}')">Editar</button>
            <button onclick="deleteVehicle('${vehicle.id}')">Excluir</button>
          </div>
        </div>
      `;
      list.appendChild(item);
    });
  } catch (error) {
    console.error("Erro ao carregar veículos:", error);
    alert("Erro ao carregar veículos");
  }
}

window.editVehicle = async function (id) {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    editId = id;
    form.title.value = data.title;
    form.short_description.value = data.short_description;
    form.year.value = data.year;
    form.price.value = data.price;
    form.cover_image_url.value = data.cover_image_url;
    form.category.value = data.category;
    form.vehicle_type.value = data.vehicle_type;
    document.getElementById("is_featured").checked = data.is_featured;
    document.getElementById("is_active").checked = data.is_active;
    if (data.is_featured) {
      document
        .getElementById("is_featured")
        .setAttribute("data-was-featured", "true");
    }
    coverImageUrlInput.value = data.cover_image_url;
    // Mostra preview da imagem de capa
    if (data.cover_image_url) {
      coverPreview.innerHTML = `<img src="${data.cover_image_url}" alt="Preview da capa">`;
    }

    imageUrls = data.gallery_urls || [];
    updateImagePreviews();
    updateGalleryInput();

    form.querySelector('button[type="submit"]').textContent = "Atualizar";
    cancelBtn.style.display = "inline";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("Erro ao editar:", error);
    alert("Erro ao carregar dados do veículo");
  }
};



window.deleteVehicle = async function (id) {
  if (!confirm("Tem certeza que deseja excluir este veículo?")) return;

  try {
    const { error } = await supabase.from("cars").delete().eq("id", id);
    if (error) throw error;
    await loadVehicles();
    alert("Veículo excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir:", error);
    alert("Erro ao excluir veículo");
  }
};

// Widget para a imagem de capa
const coverWidget = cloudinary.createUploadWidget(
  {
    cloudName: "du53gt50t",
    uploadPreset: "ml_default",
    multiple: false, // Apenas uma imagem para a capa
    sources: ["local", "url", "camera"], // Fontes permitidas
    cropping: true, // Habilitar crop
    croppingAspectRatio: 16 / 9, // Proporção recomendada para capa
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      updateCoverImage(result.info.secure_url);
    }
  }
);

// Função para atualizar a imagem de capa
function updateCoverImage(url) {
  coverImageUrlInput.value = url;
  coverPreview.innerHTML = `<img src="${url}" alt="Preview da capa">`;

  // Se estiver editando, mostra a imagem imediatamente
  if (editId) {
    const vehicleItems = document.querySelectorAll(".vehicle-item");
    vehicleItems.forEach((item) => {
      if (item.dataset.id === editId) {
        const img = item.querySelector(".vehicle-thumbnail");
        if (img) img.src = url;
      }
    });
  }
}

// Event Listener para o botão de upload da capa
uploadCoverBtn.addEventListener("click", () => {
  coverWidget.open();
});

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadVehicles();
});
