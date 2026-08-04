<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // index.php repoints the public path at the repo root, and Vite builds
        // straight to ./build to match. The test kernel does not run index.php,
        // so @vite would look for a manifest under public/ that this app never
        // serves — which made the suite depend on a stale build being left
        // there. Tests assert on responses and props, not on asset hashes.
        $this->withoutVite();
    }
}
