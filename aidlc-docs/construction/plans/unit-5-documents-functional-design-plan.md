# Functional Design Plan — Unit 5: Document Repository

## Unit Scope
- Google Drive and SharePoint OAuth 2.0 integration
- Document metadata CRUD (title, category, external file ID)
- Document browse by category and search
- Document download via external provider URL
- S3 fallback upload for non-integrated documents

## Stories Covered
- 5.1 Browse and Download Documents
- 5.2 Upload and Manage Documents

## Dependencies
- Unit 1 (auth, resident profiles, file/S3)

---

## Part 1: Clarifying Questions

### Question 1
Which document storage provider should be the primary integration?

A) Google Drive only
B) SharePoint only
C) Both — Property Manager can choose per document
D) Start with Google Drive, add SharePoint later
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
What document categories should be available?

A) Basic — Policies, Meeting Minutes, Forms, Announcements
B) Extended — Policies, Meeting Minutes, Forms, Announcements, Financial Reports, Rules & Regulations, Notices
C) Configurable — Property Manager can create and manage categories
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
Should documents have version history (multiple versions of the same document)?

A) Yes — keep all versions, show version history to PM
B) No — replacing a document overwrites the previous version
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
Should residents be able to search documents by content (full-text search) or by name/title only?

A) Name/title search only
B) Full-text search (requires indexing document content)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [ ] Step 1: Generate domain-entities.md
- [ ] Step 2: Generate business-rules.md
- [ ] Step 3: Generate business-logic-model.md
- [ ] Step 4: Generate frontend-components.md
