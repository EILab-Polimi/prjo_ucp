# General index for this section


## Add custom menu

**The Sidebar menu is added from the sb_admin theme.** Is the theme that use the menu and call the sidebar_menu.

- see `sb_admin/config/optional/system.menu.sidebar-menu.yml`

_Howto__

Menus are configuration; you can include one in your module by adding a file named `<module_root>/config/install/system.menu.foo.yml` to your codebase (replacing foo with the desired menu ID).

You could also technically use the API in a hook_install or similar:
```
$menu = \Drupal::entityTypeManager()->getStorage('menu')
  ->create([
    'langcode' => 'en',
    'status' => TRUE,
    ...
  ]);
```  
but the yml method is a bit cleaner, and I think recommended (can't find a source right now though).
