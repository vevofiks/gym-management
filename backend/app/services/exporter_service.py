import pandas as pd
from io import BytesIO
from typing import List, Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet
from decimal import Decimal
import zipfile


class ExporterService:
    def _format_value(self, value: Any, format: str) -> str:
        """Internal helper to format values based on target file format."""
        if value is None:
            return ""

        # Currency formatting for PDF
        if isinstance(value, (int, float, Decimal)) and format == "pdf":
            # If it's a negative amount (expense), format accordingly
            if value < 0:
                return f"- ₹{abs(float(value)):,.2f}"
            return f"₹{float(value):,.2f}"

        # Standard string conversion for others
        if isinstance(value, (int, float, Decimal)):
            return str(float(value)) if isinstance(value, Decimal) else str(value)

        return str(value)

    def export(
        self, data: List[Dict[str, Any]], format: str, title: str = "Report"
    ) -> BytesIO:
        """Unified entry point for single report exports."""
        if format == "csv":
            return self.export_to_csv(data)
        elif format == "excel":
            return self.export_to_excel(data)
        elif format == "pdf":
            return self.export_to_pdf(data, title)
        else:
            raise ValueError(f"Unsupported export format: {format}")

    def export_to_csv(self, data: List[Dict[str, Any]]) -> BytesIO:
        """Export data to CSV format."""
        df = pd.DataFrame(data)
        output = BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return output

    def export_to_excel(self, data: List[Dict[str, Any]]) -> BytesIO:
        """Export data to Excel format."""
        df = pd.DataFrame(data)
        output = BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Report")
        output.seek(0)
        return output

    def export_bulk_to_excel(self, reports: Dict[str, List[Dict[str, Any]]]) -> BytesIO:
        """Export multiple reports to single Excel with multiple sheets."""
        output = BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            for name, data in reports.items():
                df = pd.DataFrame(data)
                df.to_excel(
                    writer, index=False, sheet_name=name[:31]
                )  # Excel sheet name limit
        output.seek(0)
        return output

    def export_to_pdf(
        self, data: List[Dict[str, Any]], title: str = "Report"
    ) -> BytesIO:
        """Export data to PDF format using ReportLab."""
        return self.export_bulk_to_pdf({title: data}, title)

    def export_bulk_to_pdf(
        self, reports: Dict[str, List[Dict[str, Any]]], title: str = "Mega Report"
    ) -> BytesIO:
        """Export multiple reports to a single PDF."""
        from reportlab.lib.pagesizes import A4, landscape

        output = BytesIO()
        # Use landscape A4 if we have a lot of data or many columns
        doc = SimpleDocTemplate(
            output,
            pagesize=landscape(A4),
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30,
        )
        styles = getSampleStyleSheet()
        elements = []

        # Title Page/Header
        elements.append(
            Paragraph(f"<font size=18><b>{title}</b></font>", styles["Normal"])
        )
        elements.append(Spacer(1, 24))

        for name, data in reports.items():
            elements.append(
                Paragraph(f"<font size=14><b>{name}</b></font>", styles["Normal"])
            )
            elements.append(Spacer(1, 12))

            if not data:
                elements.append(
                    Paragraph("No data available for this section.", styles["Normal"])
                )
            else:
                headers = list(data[0].keys())
                table_data = [headers]
                for row in data:
                    table_data.append(
                        [self._format_value(row.get(h, ""), "pdf") for h in headers]
                    )

                # Font size based on column count to maintain readability
                col_count = len(headers)
                font_size = 9 if col_count <= 5 else 7 if col_count <= 8 else 6

                t = Table(table_data, repeatRows=1, hAlign="LEFT")
                t.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f8f9fa")),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#343a40")),
                            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("FONTSIZE", (0, 0), (-1, -1), font_size),
                            ("GRID", (0, 0), (-1, -1), 0.2, colors.HexColor("#dee2e6")),
                            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                            ("LEFTPADDING", (0, 0), (-1, -1), 4),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                            ("TOPPADDING", (0, 0), (-1, -1), 4),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ]
                    )
                )
                elements.append(t)

            elements.append(PageBreak())

        doc.build(elements)
        output.seek(0)
        return output

    def export_bulk_to_zip(self, reports: Dict[str, List[Dict[str, Any]]]) -> BytesIO:
        """Export multiple reports as CSVs inside a ZIP file."""
        output = BytesIO()
        with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for name, data in reports.items():
                df = pd.DataFrame(data)
                # Formatted data for CSV is just raw strings/objects usually
                csv_data = df.to_csv(index=False)
                zip_file.writestr(f"{name.lower().replace(' ', '_')}.csv", csv_data)
        output.seek(0)
        return output

    def generate_receipt_pdf(self, receipt_data: Dict[str, Any]) -> BytesIO:
        """Generate a professional PDF receipt."""
        output = BytesIO()
        doc = SimpleDocTemplate(output, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Gym Branding
        gym_name = receipt_data.get("gym_name", "FitDash")
        elements.append(Paragraph(f"<b>{gym_name}</b>", styles["Title"]))

        # Header Info (Address/Contact)
        header_text = f"{receipt_data.get('gym_address', '')}<br/>Contact: {receipt_data.get('gym_phone', '')}"
        elements.append(Paragraph(header_text, styles["Normal"]))
        elements.append(Spacer(1, 20))

        elements.append(Paragraph("<b>PAYMENT RECEIPT</b>", styles["Heading2"]))
        elements.append(Spacer(1, 10))

        # Receipt Info Table
        info_data = [
            [
                "Receipt No:",
                receipt_data.get("receipt_no", ""),
                "Date:",
                str(receipt_data.get("date", "")),
            ],
            [
                "Member:",
                receipt_data.get("member_name", ""),
                "Phone:",
                receipt_data.get("member_phone", ""),
            ],
        ]
        info_table = Table(info_data, colWidths=[70, 180, 50, 200])
        info_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        elements.append(info_table)
        elements.append(Spacer(1, 20))

        # Payment Details Table
        details_data = [
            ["Description", "Amount"],
            [
                receipt_data.get("description", "Membership Fee"),
                f"INR {receipt_data.get('amount', 0.0):.2f}",
            ],
        ]

        # Add taxes/discounts if any
        if receipt_data.get("tax", 0) > 0:
            details_data.append(["Tax", f"INR {receipt_data.get('tax', 0.0):.2f}"])
        if receipt_data.get("discount", 0) > 0:
            details_data.append(
                ["Discount", f"- INR {receipt_data.get('discount', 0.0):.2f}"]
            )

        details_data.append(["Total Paid", f"INR {receipt_data.get('total', 0.0):.2f}"])

        details_table = Table(details_data, colWidths=[350, 150])
        details_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (1, 0), colors.black),
                    ("ALIGN", (0, 0), (0, -1), "LEFT"),
                    ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 11),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        elements.append(details_table)
        elements.append(Spacer(1, 30))

        # Footer
        payment_method = str(receipt_data.get("payment_method", "Cash")).upper()
        elements.append(
            Paragraph(f"<b>Payment Method:</b> {payment_method}", styles["Normal"])
        )
        if receipt_data.get("transaction_id"):
            elements.append(
                Paragraph(
                    f"<b>Transaction ID:</b> {receipt_data.get('transaction_id')}",
                    styles["Normal"],
                )
            )

        elements.append(Spacer(1, 40))
        elements.append(
            Paragraph(
                "<i>This is a computer generated receipt and does not require a physical signature.</i>",
                styles["Normal"],
            )
        )
        elements.append(Spacer(1, 10))
        elements.append(
            Paragraph(
                "<center><b>Thank you for being a part of our fitness community!</b></center>",
                styles["Normal"],
            )
        )

        doc.build(elements)
        output.seek(0)
        return output


exporter_service = ExporterService()
