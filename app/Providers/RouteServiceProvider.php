<?php 

public function boot(): void
{
    $this->routes(function () {
        Route::middleware('web')
            ->prefix('admin')
            ->name('admin.')
            ->group(base_path('routes/admin.php'));
    });
}
