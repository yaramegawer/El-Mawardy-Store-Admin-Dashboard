// Selecting elements
const modal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");
const productImages = document.getElementById("productImage");
const searchInput = document.getElementById("searchInput");
const closeModalBtn = document.querySelector(".close");

let products = [];
let editIndex = null;
const token = localStorage.getItem("authToken");

console.log("Stored Token:", token);

if (!token) {
    alert("You must be logged in to manage products.");
    window.location.href = "index.html";
}

async function fetchProducts() {
    try {
        const response = await fetch("https://el-mawardy-store.vercel.app/product", {
            method: "GET",
            headers: { "token": token },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched Data:", data);

        products = Array.isArray(data.products) ? data.products : [];
        displayProducts();
    } catch (error) {
        console.error("Error fetching products:", error);
        alert("Could not load products. Please try again.");
    }
}

function displayProducts(filter = "") {
    productTable.innerHTML = "";

    products.filter(product => product.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach((product, index) => {
            console.log("Rendering product:", product);

            const images = product.images?.length > 0
                ? product.images.map(img => `<img src="${img.url}" width="50" style="margin: 5px;">`).join("")
                : `<img src="${product.defaultImage?.url || 'placeholder.jpg'}" width="50" style="margin: 5px;">`;

            console.log("Images HTML:", images);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${images}</td>
                <td style="padding-left: 20px;">${product.name}</td>
                <td style="padding-left: 20px;">${product.description || "No description"}</td>
                <td style="padding-left: 20px;">${product.price}</td>
                <td style="padding-left: 20px;">
                    <button class="edit-btn" onclick="openModal(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
                </td>
            `;
            productTable.appendChild(row);
        });
}

searchInput.addEventListener("input", function() {
    displayProducts(this.value);
});

function openModal(index = null) {
    editIndex = index;

    if (index !== null) {
        document.getElementById("modalTitle").innerText = "Edit Product";
        productName.value = products[index].name;
        productPrice.value = products[index].price;
        productDescription.value = products[index].description || "";
        productImages.required = false;
    } else {
        document.getElementById("modalTitle").innerText = "Add Product";
        productForm.reset();
        productImages.required = true;
    }

    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
    editIndex = null;
}

productForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = productName.value.trim();
    const price = productPrice.value.trim();
    const description = productDescription.value.trim();
    const imageFiles = productImages.files;

    if (!name || !price || !description || (editIndex === null && imageFiles.length < 2)) {
        alert("Please fill in all fields and upload at least two images.");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);

    if (imageFiles.length > 0) {
        formData.append("defaultImage", imageFiles[0]);
    }
    for (let i = 1; i < imageFiles.length; i++) {
        formData.append("subImage", imageFiles[i]);
    }

    try {
        let response;
        let url = "https://el-mawardy-store.vercel.app/product";
        let method = "POST";

        if (editIndex !== null) {
            const productId = products[editIndex]?._id || products[editIndex]?.id;
            if (!productId) {
                alert("Error: Product ID is missing.");
                return;
            }

            url = `https://el-mawardy-store.vercel.app/product/${productId}`;
            method = "PUT";

            if (imageFiles.length === 0) {
                response = await fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "token": token
                    },
                    body: JSON.stringify({ name, price, description })
                });
            } else {
                response = await fetch(url, {
                    method: "PUT",
                    headers: { "token": token },
                    body: formData
                });
            }
        } else {
            response = await fetch(url, {
                method: "POST",
                headers: { "token": token },
                body: formData
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to save product.");
        }

        alert("Product saved successfully!");
        await fetchProducts();
        closeModal();
    } catch (error) {
        console.error("Error saving product:", error);
        alert(error.message);
    }
});

async function deleteProduct(index) {
    try {
        const productId = products[index]?._id || products[index]?.id;
        if (!productId) {
            alert("Error: Product ID is missing.");
            return;
        }

        const response = await fetch(`https://el-mawardy-store.vercel.app/product/${productId}`, {
            method: "DELETE",
            headers: { "token": token }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to delete product.");
        }

        alert("Product deleted successfully!");
        await fetchProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
        alert(error.message);
    }
}

window.onload = function () {
    fetchProducts();
};

window.onclick = function (event) {
    if (event.target === modal) {
        closeModal();
    }
};
