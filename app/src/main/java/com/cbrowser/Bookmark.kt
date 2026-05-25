package com.cbrowser

data class Bookmark(
    val title: String,
    val url: String,
    val addedAt: Long = System.currentTimeMillis()
)

object BookmarkStore {
    // In-memory only — wiped with session (privacy by design)
    private val _items = mutableListOf<Bookmark>()
    val items: List<Bookmark> get() = _items.toList()

    fun add(title: String, url: String) {
        if (_items.none { it.url == url }) {
            _items.add(0, Bookmark(title, url))
        }
    }

    fun remove(url: String) { _items.removeAll { it.url == url } }
    fun contains(url: String) = _items.any { it.url == url }
    fun clear() { _items.clear() }
}
