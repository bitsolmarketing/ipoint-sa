<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminBannerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $banners = Banner::orderBy('position', 'asc')->orderBy('sort_order', 'asc')->get();
        return Inertia::render('Admin/Banners/Index', [
            'banners' => $banners
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:100',
            'subtitle' => 'nullable|string|max:200',
            'image_path' => 'required|string',
            'link_url' => 'nullable|string',
            'position' => 'required|in:hero,bento,zigzag,spotlight,whats_new,footer',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        $sortOrder = intval($request->input('sort_order', 0));
        $position = $request->input('position', 'hero');

        // Adjust other banners' sort_order dynamically for the same position
        Banner::where('position', $position)
            ->where('sort_order', '>=', $sortOrder)
            ->increment('sort_order');

        Banner::create([
            'title' => $request->input('title'),
            'subtitle' => $request->input('subtitle'),
            'image_path' => $request->input('image_path'),
            'link_url' => $request->input('link_url'),
            'position' => $position,
            'sort_order' => $sortOrder,
            'is_active' => $request->has('is_active') ? $request->input('is_active') : true
        ]);

        return redirect()->route('admin.banners.index')->with('success', 'Banner created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $banner = Banner::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:100',
            'subtitle' => 'nullable|string|max:200',
            'image_path' => 'required|string',
            'link_url' => 'nullable|string',
            'position' => 'required|in:hero,bento,zigzag,spotlight,whats_new,footer',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        $newSortOrder = intval($request->input('sort_order', 0));
        $oldSortOrder = $banner->sort_order;
        $position = $request->input('position');

        if ($newSortOrder !== $oldSortOrder) {
            if ($newSortOrder > $oldSortOrder) {
                Banner::where('position', $position)
                    ->where('id', '!=', $banner->id)
                    ->whereBetween('sort_order', [$oldSortOrder + 1, $newSortOrder])
                    ->decrement('sort_order');
            } else {
                Banner::where('position', $position)
                    ->where('id', '!=', $banner->id)
                    ->whereBetween('sort_order', [$newSortOrder, $oldSortOrder - 1])
                    ->increment('sort_order');
            }
        }

        $banner->update([
            'title' => $request->input('title'),
            'subtitle' => $request->input('subtitle'),
            'image_path' => $request->input('image_path'),
            'link_url' => $request->input('link_url'),
            'position' => $position,
            'sort_order' => $newSortOrder,
            'is_active' => $request->input('is_active')
        ]);

        return redirect()->route('admin.banners.index')->with('success', 'Banner updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner deleted successfully.');
    }
}
