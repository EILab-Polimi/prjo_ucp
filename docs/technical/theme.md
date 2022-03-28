# Drupal 8

## Theming

The structure of templates is composed from
- html.html.twig - the main container with header
- page.html.twig - here is where we print out **regions** and the blocks inside the regions

  We can customize the page template to be filled with different contents taken from Drupal [see Front page](#front-page)

For the individual content (entities) we have to discriminate between
- templates in view mode - the suggestions are printed and is possible to split the node items that are stored inside the _content_ variable
- templates in edit mode - in edit mode what is printed is the _form_ (the template is called is `form.html.twig`) and usually there are no template suggestions for _form_. To override this kind of templates we need to **add** _template suggestions_ and specifiy the theme for the form see [Nodes in edit mode](#nodes-in-edit-mode)


https://www.drupal.org/docs/theming-drupal/twig-in-drupal/twig-template-naming-conventions

### Front page
Dobbiamo anzitutto distinguere tra contenuti statici e non, e se siamo in frontpage o no.

Per i contenuti statici in frontpage possiamo utilizzare `hook_preprocess_page` nel MY_THEME.theme file.

`function MY_THEME_preprocess_page(&$variables)`

Possiamo aggiungere ulteriori 'elementi' nella `$variables` che saranno poi disponibili nel twig template della page `page.html.twig`.

- Inserire un form
```php caption="Insert a form"
// Load the service renderer
$render = Drupal::service('renderer');
// User login form
$login_form = Drupal::formBuilder()->getForm('Drupal\user\Form\UserLoginForm');
$variables['login_form'] = $render->renderPlain($login_form);
```

- Inserire una view
```php caption="Insert a view"
if ($is_front_page = \Drupal::service('path.matcher')->isFrontPage()) {
     // Homepage carousel view.
     $homepage_carousel_view_name = 'homepage_carousel';
     $homepage_carousel_view_display = 'default';
     $homepage_carousel_view_results = views_get_view_result($homepage_carousel_view_name, $homepage_carousel_view_display);
     $result = count($homepage_carousel_view_results);
     // Set variable if the view has results.
     if ($result) {
       $variables['homepage_carousel_view'] = views_embed_view($homepage_carousel_view_name, $homepage_carousel_view_display);
     }
}     
```

Per aggiungere 'elementi' ad un nodo di un determinato tipo (content type) usiamo `hook_preprocess_node`
```
/**
  * Implements hook_preprocess_node(&$variables).
  */
  function wisstore_preprocess_node(&$variables) {
   if (isset($variables['node'])) {
     $node = $variables['node'];
     // Blog Post.
     if ($node->getType() === 'blog_post') {
        // User.
        if (isset($node->get('uid')->entity)) {
          $blog_author_id = $node->get('uid')->entity->id();
          $blog_author_name = $node->get('uid')->entity->getUsername();

          $variables['blog_author_id'] = $blog_author_id;
          $variables['blog_author_name'] = $blog_author_name;
        }

        // Date.
        if (!empty($node->field_post_date)) {
          $post_date = strtotime($node->field_post_date->value);
          $variables['blog_post_date'] = \Drupal::service('date.formatter')->format($post_date, 'custom', 'M j, Y');
        }

        // Image.
        if (isset($node->field_blog_image->entity)) {
          $variables['blog_image_url'] = ImageStyle::load('banner')->buildUrl($node->field_blog_image->entity->getFileUri());
        }
      }
```

### Nodes in edit mode
To customize the nodes in edit mode based on the content type we need to proceed in two steps.

First we specify a general theme template to be called for each node form.
This is taken from the Seven theme implementation.
Otherwise the deafult `form.html.twig` template is called
```
/**
 * Implements hook_form_BASE_FORM_ID_alter() for \Drupal\node\NodeForm.
 */

/* Taken from seven theme implementation */
/* We add the node_edit_form theme to all node form */
function MY_THEME_form_node_form_alter(&$form, \Drupal\Core\Form\FormStateInterface $form_state) {
  $form['#theme'] = ['node_edit_form'];
}
```

Next we specialize the template to be rendered suggesting a per content type template for the specific form
```
/**
 * Implements hook_theme_suggestions_alter().
 */

/* Used in combination with the prevoius we suggest a per content type form template */
function MY_THEME_theme_suggestions_alter(array &$suggestions, array $variables, $hook) {
  // kint($hook);
  if ($hook == 'node_edit_form') {
    // kint('test');
    if ($node = \Drupal::routeMatch()->getParameter('node')) {
      $content_type = $node->bundle();
    } else {
      $current_path = \Drupal::service('path.current')->getPath();
      $path_args = explode('/', $current_path);
      $content_type = $path_args[3];
    }
    $suggestions[] = 'node_edit_form__' . $content_type;
  }
}
```

### Template file
Il twig template file `*.html.twig` che verrà caricato dipende poi dal template suggestion che viene designato per la pagina o nodo caricato.

### User templates



# Services and dependecy injection
Service && Service Interface - a service implement it's interface

- Dependency injection is used to load _Services_ inside
  - plugins : a plugin <u>extend</u> **BlockBase** for example. For dependency injection in plugins the plugin has to <u>implement</u> **ContainerFactoryPluginInterface**
  - controller : a controller <u>extend</u> **ControllerBase** that already <u>implements</u> **ContainerFactoryPluginInterface**
  - form : a form <u>extend</u> FormBase ??ConfigFormBase??

https://drupal.stackexchange.com/questions/239783/how-to-use-dependency-injection-for-plugins-blocks-drupalformbuilder-and

## Customize a form

> https://www.foreach.be/blog/how-manipulate-forms-drupal-8

In Drupal 8 a form is a class and several base classes are provided in the open source core. **FormBase** is the most generic one; more specific form bases are **ConfigFormBase**, **ConfirmFormBase**, and **EntityForm**. You can build new forms for your application directly from these bases, but you can also start from one of the standard forms that are provided by Drupal 8.


## Customize the user registration form
While UserLoginForm is a regular form based on form api,

RegisterForm is an entity form,

for example the _actions_ are defined in a separate method _EntityForm::actions()_, which is overridden in RegisterForm:
```
class RegisterForm extends AccountForm {
  ...
  protected function actions(array $form, FormStateInterface $form_state) {
    $element = parent::actions($form, $form_state);
    $element['submit']['#value'] = $this->t('Create new account');
    return $element;
  }
  ...
}  
```  
which you can override again in your extended class.
```
class MultiStepRegistrationForm extends RegisterForm {
  ...
  protected function actions(array $form, FormStateInterface $form_state) {

    // Customize the submit button label
    $element = parent::actions($form, $form_state);
    $element['submit']['#value'] = 'Custom Submit';
    return $element;
  }
  ...
}  
```

In the same way we can override the _EntityForm::builForm()_ method in our extended class

If we want to change the form for an EntityForm

In your .module file:
```
function your_module_entity_type_alter(array &$entity_types) {
  $entity_types['user']->setFormClass('register', '\Drupal\your_module\Form\NewRegisterForm');
}
```
This overrides the Annotations set in User.php
```
*   handlers = {
 *     "storage" = "Drupal\user\UserStorage",
 *     "storage_schema" = "Drupal\user\UserStorageSchema",
 *     "access" = "Drupal\user\UserAccessControlHandler",
 *     "list_builder" = "Drupal\user\UserListBuilder",
 *     "views_data" = "Drupal\user\UserViewsData",
 *     "route_provider" = {
 *       "html" = "Drupal\user\Entity\UserRouteProvider",
 *     },
 *     "form" = {
 *       "default" = "Drupal\user\ProfileForm",
 *       "cancel" = "Drupal\user\Form\UserCancelForm",
 *       "register" = "Drupal\user\RegisterForm"
 *     },
 *     "translation" = "Drupal\user\ProfileTranslationHandler"
 *   },
```
The one we're interesting in is the "register" key under "form".

Then in your NewRegisterForm.php you don't need to implement `__construct` or `create`, as these are inherited from RegisterForm. In my case, I just wanted to change the submit button text, so I have:

```
class NewRegisterForm extends RegisterForm {

  protected function actions(array $form, FormStateInterface $form_state) {
    $element = parent::actions($form, $form_state);
    $element['submit']['#value'] = 'Submit';
    return $element;
  }

}
```

here is a full override of `RegisterForm` https://drupal.stackexchange.com/questions/278579/how-do-i-override-the-registration-form

When implementing the RouteSubscriber we have to implement `__construct` and `create` inside the class that extends `RegisterForm`
This way the code is a kind of hack to use an entity form in `_form` of a route like implemented in the RouteSubscriber.
???
Normally you use it in `_entity_form` and then the entity is provided by _EntityForm:getEntityFromRouteMatch()_
???



Another way is the following (it's like https://www.flocondetoile.fr/blog/provide-custom-mode-form-entities-drupal-8)

First you need to add the form to the entity do this in the module file in hook_entity_type_build something like

```
/**
 * Implements hook_entity_build
 */
function myModule_entity_type_build(array &$entity_types) {
  $entity_types['user']->setFormClass('myModule_register', 'Drupal\myModule\Form\myModuleRegisterForm');
}
```
Create a new class to extend RegisterForm

```
namespace Drupal\myModule\Form;

use Drupal\Core\Form\FormStateInterface;
use Drupal\user\RegisterForm;

class myModuleRegisterForm extends RegisterForm {

    /**
     * {@inheritdoc}
     */
    public function form(array $form, FormStateInterface $form_state) {
        $form = parent::form($form, $form_state);
        // Change the form here
        return $form;
    }
}
```
Then load it in your controller

```
public function myModuleRegister{
       $build = [];

        $entity = \Drupal::entityManager()
                ->getStorage('user')
                ->create(array());

        $formObject = \Drupal::entityManager()
                ->getFormObject('user', 'myModule_register')
                ->setEntity($entity);

        $build['form'] = \Drupal::formBuilder()->getForm($formObject);
        return $build;
}
```
That pretty much covers it, obviously you need the route to point to the appropriate function in your controller but otherwise this should do it. Hope it helps.


Non usiamo niente di quanto sopra in quanto NON riusciamo a fare la validazione finale ed il submit così come viene fatto nel classico register.

Quindi usiamo il classico hook_form_FORM_ID_alter

1. Definire la gestione dell'address ?? Bisogna slavarlo per utente o per gruppo o per entrambi ??
  Nel caso dello user l'address non deve avere il campo Company impostato
  Nel caso del gruppo l'address deve avere il campo Company impostato



## Radio button n/a

Assuming you don't want to make it required, here are the steps to remove this option.

Firstly, you need to add a process function for the radio buttons (you must create a module and insert this code in it)
```
function yourmodule_element_info_alter(array &$types) {
  if (isset($types['radios'])) {
    $types['radios']['#process'][] = 'remove_radio_na';
  }
}
```
Then create the process function. Let say that you have several boolean fields and you would like to remove the n/a option only for the field "field_bool_no_na"
```
function remove_radio_na($element) {
  if ($element['#field_name']=='field_bool_no_na') {
    unset($element['_none']);
  }
  return $element;
}
```

## Export content type / entity configuration
From development single export we need the following elements related to the content type / entity
- Field Storage
- Field
- Entity View Display
- Entity Form Display
