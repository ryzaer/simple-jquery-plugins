
# jQuery Abbr Plugin

## Deskripsi
Plugin jQuery untuk menulis notasi HTML singkat (abbreviation) seperti pada Emmet dan memparsingnya menjadi elemen HTML utuh.

## Penggunaan
```javascript
// Format dasar
$.abbr('tag#id.class{content}[attribute=value]', beautify);

// Contoh sederhana
$.abbr('div#myDiv.box{Hello}[data-role=test]', true);

// Contoh multi line (nested)
$.abbr('ul>(li.item{Item 1}|li.item{Item 2})', true);
```

## Parameter
- **_args**: String notasi singkat (Emmet-like syntax).
- **beautify**: (Optional) Jika true, output HTML akan dirapikan.

## Fitur
- Parsing ID, class, content, dan atribut.
- Mendukung multi line (nested element).
- Mendukung auto beautifier (HTML indented).

## Lisensi
Free to use for any purpose.
