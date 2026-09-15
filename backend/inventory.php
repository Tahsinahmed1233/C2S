<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'stats':
        getInventoryStats($conn);
        break;
    case 'products':
        getProducts($conn);
        break;
    case 'add':
        addProduct($conn);
        break;
    case 'update':
        updateProduct($conn);
        break;
    case 'delete':
        deleteProduct($conn);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function getInventoryStats($conn) {
    $stats = [];
    
    // Total products
    $result = $conn->query("SELECT COUNT(*) as total FROM products");
    $stats['total_products'] = $result->fetch_assoc()['total'];
    
    // Total stock quantity
    $result = $conn->query("SELECT SUM(quantity) as total FROM products");
    $stats['total_stock'] = $result->fetch_assoc()['total'] ?? 0;
    
    // Low stock items
    $result = $conn->query("SELECT COUNT(*) as total FROM products WHERE quantity <= threshold_value AND quantity > 0");
    $stats['low_stock'] = $result->fetch_assoc()['total'];
    
    // Out of stock items
    $result = $conn->query("SELECT COUNT(*) as total FROM products WHERE quantity = 0");
    $stats['out_of_stock'] = $result->fetch_assoc()['total'];
    
    // Inventory value
    $result = $conn->query("SELECT SUM(buying_price * quantity) as total FROM products");
    $stats['inventory_value'] = $result->fetch_assoc()['total'] ?? 0;
    
    // Reorder required
    $result = $conn->query("SELECT COUNT(*) as total FROM products WHERE quantity <= threshold_value");
    $stats['reorder_required'] = $result->fetch_assoc()['total'];
    
    echo json_encode(['success' => true, 'data' => $stats]);
}

function getProducts($conn) {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    
    $search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';
    
    $where = '';
    if ($search) {
        $where = "WHERE product_name LIKE '%$search%' OR product_code LIKE '%$search%'";
    }
    
    // Get total count
    $count_query = "SELECT COUNT(*) as total FROM products $where";
    $result = $conn->query($count_query);
    $total = $result->fetch_assoc()['total'];
    
    // Get products
    $query = "SELECT * FROM products $where ORDER BY id DESC LIMIT $limit OFFSET $offset";
    $result = $conn->query($query);
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $products,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

function addProduct($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $product_name = $data['product_name'] ?? '';
    $product_code = $data['product_code'] ?? '';
    $category = $data['category'] ?? '';
    $buying_price = $data['buying_price'] ?? 0;
    $selling_price = $data['selling_price'] ?? 0;
    $quantity = $data['quantity'] ?? 0;
    $threshold_value = $data['threshold_value'] ?? 10;
    $manufacture_date = $data['manufacture_date'] ?? null;
    $supplier = $data['supplier'] ?? '';
    
    // Determine status
    $status = 'in_stock';
    if ($quantity == 0) {
        $status = 'out_of_stock';
    } elseif ($quantity <= $threshold_value) {
        $status = 'low_stock';
    }
    
    $stmt = $conn->prepare("INSERT INTO products (product_name, product_code, category, buying_price, selling_price, quantity, threshold_value, manufacture_date, supplier, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssdisiss", $product_name, $product_code, $category, $buying_price, $selling_price, $quantity, $threshold_value, $manufacture_date, $supplier, $status);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add product: ' . $conn->error]);
    }
    
    $stmt->close();
}

function updateProduct($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'] ?? 0;
    $product_name = $data['product_name'] ?? '';
    $product_code = $data['product_code'] ?? '';
    $category = $data['category'] ?? '';
    $buying_price = $data['buying_price'] ?? 0;
    $selling_price = $data['selling_price'] ?? 0;
    $quantity = $data['quantity'] ?? 0;
    $threshold_value = $data['threshold_value'] ?? 10;
    $manufacture_date = $data['manufacture_date'] ?? null;
    $supplier = $data['supplier'] ?? '';
    
    // Determine status
    $status = 'in_stock';
    if ($quantity == 0) {
        $status = 'out_of_stock';
    } elseif ($quantity <= $threshold_value) {
        $status = 'low_stock';
    }
    
    $stmt = $conn->prepare("UPDATE products SET product_name = ?, product_code = ?, category = ?, buying_price = ?, selling_price = ?, quantity = ?, threshold_value = ?, manufacture_date = ?, supplier = ?, status = ? WHERE id = ?");
    $stmt->bind_param("ssssdisissi", $product_name, $product_code, $category, $buying_price, $selling_price, $quantity, $threshold_value, $manufacture_date, $supplier, $status, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update product: ' . $conn->error]);
    }
    
    $stmt->close();
}

function deleteProduct($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    
    $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete product: ' . $conn->error]);
    }
    
    $stmt->close();
}

$conn->close();
?>