console.log("Script Loaded");
document.addEventListener('DOMContentLoaded', function() {
    const printButton = document.getElementById("printButton");
    if (printButton) {
    printButton.addEventListener("click", () => {
    const recentTransaction = document.querySelector("#transactionTableBody tr");

    if (recentTransaction) {
        const printWindow = window.open('', '', 'width=600,height=400');

        // Embedded CSS for print
        printWindow.document.write(`
            <style>
                /* General Styling for the Print Window */
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 0;
                }

                h2, h3 {
                    text-align: center;
                    font-size: 20px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    padding: 10px;
                    text-align: left;
                    border: 1px solid #ddd;
                }

                /* Hide buttons for printing */
                .button-container, #printButton {
                    display: none;
                }

                /* Page setup for printing */
                @page {
                    size: A4;
                    margin: 20mm;
                }
            </style>
        `);

        printWindow.document.write("</head><body>");

        // Title and table structure for printing
        printWindow.document.write("<h2>Transaction Details</h2>");
        printWindow.document.write("<table>");

        // Table Header
        printWindow.document.write("<thead><tr>");
        printWindow.document.write("<th>Date</th><th>Customer Name</th><th>Moble No</th><th>Medicine</th><th>Quantity</th><th>Selling Price</th><th>Amount paid</th><th>Amount pending</th><th>Total Amount</th>");
        printWindow.document.write("</tr></thead>");

        // Table Body with the transaction data
        const row = document.querySelector("#transactionTableBody tr")
    
        if (row) {
            printWindow.document.write('<tr>');
            
            const cells = row.querySelectorAll('td');
            
            printWindow.document.write(`<td>${cells[1].textContent}</td>`); 
            printWindow.document.write(`<td>${cells[2].textContent}</td>`); 
            printWindow.document.write(`<td>${cells[3].textContent}</td>`); 
            printWindow.document.write(`<td>${cells[4].textContent}</td>`); 
            printWindow.document.write(`<td>${cells[5].textContent}</td>`); 
            printWindow.document.write(`<td>${cells[7].textContent}</td>`); 
            printWindow.document.write(`<td>${cells[9].textContent}</td>`); 
            printWindow.document.write(`<td>${cells[10].textContent}</td>`); 
            printWindow.document.write(`<td>${cells[11].textContent}</td>`); 

            printWindow.document.write('</tr>');
        };
        printWindow.document.write("</tr>");
        printWindow.document.write("</tbody>");

        // Close the table
        printWindow.document.write("</table>");
        
        printWindow.document.write("</body></html>");
        printWindow.document.close();

        // Trigger the print dialog
        printWindow.print();
    } else {
        alert("No transaction found to print.");
    }
});
    }
});


function searchCustomer() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#transactionTableBody tr");
    let visibleCount = 0;

    rows.forEach(row => {
        const customerName = row.cells[2]?.innerText.toLowerCase();
        if (customerName.includes(input)) {
            row.style.display = "";
            visibleCount++;
        } else {
            row.style.display = "none";
        }
    });
    // Show "No Records Available" message if no rows are visible
    const noRecordMessage = document.getElementById("noRecordRow");
    if (visibleCount === 0) {
        if (!noRecordMessage) {
            const newRow = document.createElement("tr");
            newRow.id = "noRecordRow";
            newRow.innerHTML = `<td colspan="13" style="text-align: center; color: red;">No Records Available</td>`;
            document.getElementById("transactionTableBody").appendChild(newRow);
        }
    } else {
        if (noRecordMessage) {
            noRecordMessage.remove(); // Remove the "No Records Available" message if rows are visible
        }
    }
}

function editAmount(customerId, amountPending) {
    customerId = Number(customerId);
    amountPending = Number(amountPending);
    // Set the values in the modal form
    document.getElementById('customerId').value = customerId;
    document.getElementById('amountPending').value = amountPending;

    // Show the modal (assuming you have a modal setup)
    $('#editAmountModal').modal('show');
}





 
